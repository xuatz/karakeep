import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n/client";
import { Archive } from "lucide-react";

import { BookmarkListsEditor } from "./BookmarkListsEditor";
import ArchiveBookmarkButton from "./action-buttons/ArchiveBookmarkButton";

export default function ManageListsModal({
  bookmarkId,
  open,
  setOpen,
}: {
  bookmarkId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("actions.manage_lists")}</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <BookmarkListsEditor bookmarkId={bookmarkId} />
        </div>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              {t("actions.close")}
            </Button>
          </DialogClose>
          <ArchiveBookmarkButton
            type="button"
            bookmarkId={bookmarkId}
            onDone={() => setOpen(false)}
            variant="secondary"
          >
            <Archive className="mr-2 size-4" /> {t("actions.archive")}
          </ArchiveBookmarkButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useManageListsModal(bookmarkId: string) {
  const [open, setOpen] = useState(false);

  return {
    open,
    setOpen,
    content: open && (
      <ManageListsModal bookmarkId={bookmarkId} open={open} setOpen={setOpen} />
    ),
  };
}
