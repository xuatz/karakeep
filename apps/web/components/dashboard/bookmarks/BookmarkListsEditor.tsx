import { ActionButton } from "@/components/ui/action-button";
import { toast } from "@/components/ui/sonner";
import LoadingSpinner from "@/components/ui/spinner";
import { useClientConfig } from "@/lib/clientConfig";
import { useTranslation } from "@/lib/i18n/client";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";

import {
  useAddBookmarkToList,
  useBookmarkLists,
  useRemoveBookmarkFromList,
} from "@karakeep/shared-react/hooks/lists";
import { useTRPC } from "@karakeep/shared-react/trpc";
import { listNameFromPath } from "@karakeep/shared/utils/listUtils";

import { BookmarkListSelector } from "../lists/BookmarkListSelector";

export function BookmarkListsEditor({
  bookmarkId,
  disabled,
}: {
  bookmarkId: string;
  disabled?: boolean;
}) {
  const api = useTRPC();
  const { t } = useTranslation();
  const demoMode = !!useClientConfig().demoMode;
  const isDisabled = demoMode || disabled;

  const { data: allLists, isPending: isAllListsPending } = useBookmarkLists();
  const { data: alreadyInList, isPending: isAlreadyInListPending } = useQuery(
    api.lists.getListsOfBookmark.queryOptions({ bookmarkId }),
  );

  const onError = (e: { data?: { code?: string } | null; message: string }) => {
    if (e.data?.code == "BAD_REQUEST") {
      toast({
        variant: "destructive",
        description: e.message,
      });
    } else {
      toast({
        variant: "destructive",
        title: t("common.something_went_wrong"),
      });
    }
  };

  const { mutate: addToList } = useAddBookmarkToList({
    onSuccess: () => {
      toast({
        description: t("toasts.lists.updated"),
      });
    },
    onError,
  });

  const {
    mutate: removeFromList,
    isPending: isRemoveFromListPending,
    variables: removeFromListVariables,
  } = useRemoveBookmarkFromList({
    onSuccess: () => {
      toast({
        description: t("toasts.lists.updated"),
      });
    },
    onError,
  });

  if (isAllListsPending || isAlreadyInListPending) {
    return <LoadingSpinner />;
  }

  const lists = alreadyInList?.lists ?? [];
  const listName = (list: { id: string; icon: string; name: string }) => {
    const path = allLists?.getPathById(list.id);
    return path ? listNameFromPath(path) : `${list.icon} ${list.name}`;
  };

  return (
    <div className="flex flex-col gap-2">
      {lists.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {lists.map((list) => (
            <li
              key={list.id}
              className="flex min-h-8 items-center gap-1 rounded bg-accent px-2 text-sm"
            >
              <span>{listName(list)}</span>
              {!isDisabled && (
                <ActionButton
                  type="button"
                  variant="ghost"
                  size="none"
                  className="rounded-full p-0.5"
                  spinner={<LoadingSpinner className="size-3" />}
                  loading={
                    isRemoveFromListPending &&
                    removeFromListVariables?.listId === list.id
                  }
                  onClick={() =>
                    removeFromList({ bookmarkId, listId: list.id })
                  }
                >
                  <X className="size-3" />
                  <span className="sr-only">Remove from {list.name}</span>
                </ActionButton>
              )}
            </li>
          ))}
        </ul>
      )}
      <BookmarkListSelector
        value={null}
        placeholder={t("actions.add_to_list")}
        hideBookmarkIds={lists.map((l) => l.id)}
        listTypes={["manual"]}
        disabled={isDisabled}
        onChange={(listId) => addToList({ bookmarkId, listId })}
      />
    </div>
  );
}
