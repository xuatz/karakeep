"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ExternalLink } from "lucide-react";

interface NotePopoverProps {
  note: string;
  bookmarkId: string;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function NotePopover({
  note,
  bookmarkId,
  children,
  open,
  onOpenChange,
}: NotePopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  if (!note?.trim()) {
    return <>{children}</>;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-96 max-w-[calc(100vw-2rem)]" align="start">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Note</h4>
          <div className="max-h-60 overflow-y-auto whitespace-pre-wrap break-words text-sm text-gray-700 dark:text-gray-300">
            {note}
          </div>
          <div className="flex justify-end border-t pt-3">
            <Link href={`/dashboard/preview/${bookmarkId}`}>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setIsOpen(false)}
              >
                Edit in full view
                <ExternalLink className="size-3" />
              </Button>
            </Link>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
