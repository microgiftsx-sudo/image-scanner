"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

type ImageViewerProps = {
  imageUrl: string | null;
  transformStyle: CSSProperties;
  isDragActive: boolean;
  isPanning: boolean;
  onFileDrop: (file: File) => void;
  onDragStateChange: (isActive: boolean) => void;
  onWheelZoom: (deltaY: number) => void;
  onPanStart: (x: number, y: number) => void;
  onPanMove: (x: number, y: number) => void;
  onPanEnd: () => void;
};

export function ImageViewer({
  imageUrl,
  transformStyle,
  isDragActive,
  isPanning,
  onFileDrop,
  onDragStateChange,
  onWheelZoom,
  onPanStart,
  onPanMove,
  onPanEnd,
}: ImageViewerProps) {
  const viewerFrameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const viewerFrame = viewerFrameRef.current;
    if (!viewerFrame) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      onWheelZoom(event.deltaY);
    };

    viewerFrame.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      viewerFrame.removeEventListener("wheel", handleWheel);
    };
  }, [onWheelZoom]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    onDragStateChange(true);
  };

  const handleDragLeave = () => {
    onDragStateChange(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    onDragStateChange(false);

    const droppedFile = event.dataTransfer.files?.[0];
    if (!droppedFile) {
      return;
    }

    onFileDrop(droppedFile);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onPanStart(event.clientX, event.clientY);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPanMove(event.clientX, event.clientY);
  };

  if (!imageUrl) {
    return (
      <div
        className={`viewerEmptyState ${isDragActive ? "viewerEmptyStateDragActive" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p>لم يتم اختيار صورة بعد.</p>
        <span>اسحب الصورة وأفلتها هنا، أو استخدم زر الرفع من مركز التحكم.</span>
      </div>
    );
  }

  return (
    <div
      ref={viewerFrameRef}
      className={`viewerFrame ${isPanning ? "viewerFramePanning" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={onPanEnd}
      onPointerLeave={onPanEnd}
    >
      <Image
        src={imageUrl}
        alt="Uploaded preview"
        fill
        sizes="(max-width: 768px) 100vw, 960px"
        unoptimized
        style={transformStyle}
        className="viewerImage"
      />
    </div>
  );
}

