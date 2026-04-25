"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

type ImageViewerProps = {
  imageUrl: string | null;
  transformStyle: CSSProperties;
};

export function ImageViewer({ imageUrl, transformStyle }: ImageViewerProps) {
  if (!imageUrl) {
    return (
      <div className="viewerEmptyState">
        <p>لم يتم اختيار صورة بعد.</p>
        <span>يرجى رفع صورة لبدء المعاينة.</span>
      </div>
    );
  }

  return (
    <div className="viewerFrame">
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

