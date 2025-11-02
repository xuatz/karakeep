"use client";

import { cn } from "@/lib/utils";
import { NotepadText } from "lucide-react";

interface NotePreviewProps {
  note: string;
  className?: string;
}

export function NotePreview({ note, className }: NotePreviewProps) {
  if (!note?.trim()) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex cursor-pointer items-center gap-1.5 text-sm italic text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
        className,
      )}
    >
      <NotepadText className="size-5 shrink-0" />
      <div className="line-clamp-2 min-w-0 flex-1 overflow-hidden text-wrap break-words">
        {note}
      </div>
    </div>
  );
}
