import React, { useState, useRef, useEffect } from 'react';

const WorkspaceLayout = ({ leftPanel, rightTopPanel, rightBottomPanel, isFullScreen = false }) => {
  const [leftWidth, setLeftWidth] = useState(40); // left pane percentage
  const [topHeight, setTopHeight] = useState(60); // top right pane percentage
  const containerRef = useRef(null);
  const rightContainerRef = useRef(null);

  const isResizingRef = useRef(false);
  const isResizingVertRef = useRef(false);

  const handleMouseDown = (e) => {
    isResizingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseDownVert = (e) => {
    isResizingVertRef.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingRef.current && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        if (newLeftWidth > 20 && newLeftWidth < 80) {
          setLeftWidth(newLeftWidth);
        }
      }

      if (isResizingVertRef.current && rightContainerRef.current) {
        const containerRect = rightContainerRef.current.getBoundingClientRect();
        const newTopHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100;
        if (newTopHeight > 20 && newTopHeight < 85) {
          setTopHeight(newTopHeight);
        }
      }
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      isResizingVertRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`flex-1 flex overflow-hidden w-full relative bg-[#0b0f19] ${isFullScreen ? 'h-screen' : 'h-full'}`}
    >
      {/* LEFT PANEL */}
      <div
        style={{ width: `${leftWidth}%` }}
        className="h-full overflow-hidden flex flex-col min-w-[200px]"
      >
        {leftPanel}
      </div>

      {/* DRAGGABLE VERTICAL SPLITTER */}
      <div
        onMouseDown={handleMouseDown}
        className="w-1.5 hover:w-2 bg-[#1e293b] border-x border-[#0f172a] cursor-col-resize hover:bg-orange-500/50 transition-all flex items-center justify-center shrink-0 z-20 group"
      >
        <div className="w-[2px] h-8 bg-slate-600 rounded group-hover:bg-orange-500 transition-colors" />
      </div>

      {/* RIGHT PANEL CONTAINER */}
      <div
        ref={rightContainerRef}
        style={{ width: `${100 - leftWidth}%` }}
        className="h-full overflow-hidden flex flex-col min-w-[300px]"
      >
        {/* RIGHT TOP PANEL */}
        <div
          style={{ height: `${topHeight}%` }}
          className="w-full overflow-hidden flex flex-col"
        >
          {rightTopPanel}
        </div>

        {/* DRAGGABLE HORIZONTAL SPLITTER */}
        <div
          onMouseDown={handleMouseDownVert}
          className="h-1.5 hover:h-2 bg-[#1e293b] border-y border-[#0f172a] cursor-row-resize hover:bg-orange-500/50 transition-all flex items-center justify-center shrink-0 z-20 group"
        >
          <div className="w-8 h-[2px] bg-slate-600 rounded group-hover:bg-orange-500 transition-colors" />
        </div>

        {/* RIGHT BOTTOM PANEL */}
        <div
          style={{ height: `${100 - topHeight}%` }}
          className="w-full overflow-hidden flex flex-col"
        >
          {rightBottomPanel}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
