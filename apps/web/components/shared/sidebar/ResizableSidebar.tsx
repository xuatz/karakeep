"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";
const DEFAULT_SIZE = 20; // 20% of the viewport
const MIN_SIZE = 15; // Minimum 15%
const MAX_SIZE = 30; // Maximum 30%

export default function ResizableSidebar({
  children,
  content,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [defaultSize, setDefaultSize] = useState(DEFAULT_SIZE);

  // Load saved state from localStorage on mount
  useEffect(() => {
    const savedWidth = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    const savedCollapsed = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);

    if (savedWidth) {
      const width = parseFloat(savedWidth);
      if (!isNaN(width)) {
        setDefaultSize(width);
      }
    }

    if (savedCollapsed === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const handleResize = useCallback((size: number) => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, size.toString());
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const newValue = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, newValue.toString());
      return newValue;
    });
  }, []);

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full">
      <ResizablePanel
        defaultSize={defaultSize}
        minSize={MIN_SIZE}
        maxSize={MAX_SIZE}
        collapsible={true}
        collapsedSize={0}
        onResize={handleResize}
        ref={(ref) => {
          if (ref && isCollapsed) {
            ref.collapse();
          }
        }}
        className="relative"
      >
        <div className="flex h-full flex-col">
          {children}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="absolute right-0 top-2 z-10 h-8 w-8 rounded-full p-0"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={100 - defaultSize} minSize={70}>
        {content}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
