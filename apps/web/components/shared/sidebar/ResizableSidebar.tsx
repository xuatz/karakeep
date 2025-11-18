"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";
const DEFAULT_SIZE = 17; // ~240px on typical 1440px viewport (same as original w-60)
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
  const panelRef = useRef<ImperativePanelHandle>(null);

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

  // Collapse the panel if the state is set
  useEffect(() => {
    if (panelRef.current) {
      if (isCollapsed) {
        panelRef.current.collapse();
      } else {
        panelRef.current.expand();
      }
    }
  }, [isCollapsed]);

  const handleResize = useCallback((size: number) => {
    // Don't save if the panel is collapsed
    if (size > 0) {
      localStorage.setItem(SIDEBAR_WIDTH_KEY, size.toString());
      // If user manually resizes to expand, update collapsed state
      setIsCollapsed(false);
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, "false");
    } else {
      // If size becomes 0, it's collapsed
      setIsCollapsed(true);
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, "true");
    }
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
        ref={panelRef}
        defaultSize={defaultSize}
        minSize={MIN_SIZE}
        maxSize={MAX_SIZE}
        collapsible={true}
        collapsedSize={0}
        onResize={handleResize}
        className="relative"
      >
        <div className="flex h-full flex-col">{children}</div>
      </ResizablePanel>
      <ResizableHandle
        withHandle
        onCollapseToggle={toggleCollapse}
        isCollapsed={isCollapsed}
      />
      <ResizablePanel defaultSize={100 - defaultSize} minSize={70}>
        {content}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
