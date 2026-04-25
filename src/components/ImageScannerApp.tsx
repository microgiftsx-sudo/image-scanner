"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { ImageViewer } from "@/components/ImageViewer";
import { ViewerToolbar } from "@/components/ViewerToolbar";
import { useImageTransforms } from "@/hooks/useImageTransforms";
import { validateImageFile } from "@/lib/fileValidation";
import type { ImageFileState } from "@/types/image";

export function ImageScannerApp() {
  const [imageState, setImageState] = useState<ImageFileState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { transforms, transformStyle, actions } = useImageTransforms();

  useEffect(() => {
    return () => {
      if (imageState?.previewUrl) {
        URL.revokeObjectURL(imageState.previewUrl);
      }
    };
  }, [imageState]);

  const scalePercent = useMemo(() => `${Math.round(transforms.scale * 100)}%`, [transforms.scale]);

  const handleFileSelected = (file: File) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    actions.reset();

    setImageState((current) => {
      if (current?.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }

      return {
        file,
        previewUrl: URL.createObjectURL(file),
      };
    });
  };

  return (
    <main className="pageContainer">
      <section className="scannerCard">
        <div className="govHeader">
          <div>
            <p className="sectorTag">منصة الخدمات الرقمية</p>
            <h1>نظام فحص الصور</h1>
            <p className="subtitle">واجهة رسمية لرفع الصور ومراجعتها عبر أدوات تحكم دقيقة.</p>
          </div>
          <span className="statusBadge">بيئة تشغيل داخلية</span>
        </div>

        <ImageUploader onFileSelected={handleFileSelected} />

        {error ? <p className="errorText">{error}</p> : null}

        <ViewerToolbar
          disabled={!imageState}
          onRotateClockwise={actions.rotateClockwise}
          onFlipHorizontal={actions.toggleFlipX}
          onFlipVertical={actions.toggleFlipY}
          onZoomIn={actions.zoomIn}
          onZoomOut={actions.zoomOut}
          onReset={actions.reset}
        />

        <div className="statusRow">
          <span>زاوية الدوران: {transforms.rotation % 360}°</span>
          <span>مستوى التكبير: {scalePercent}</span>
          <span>الملف الحالي: {imageState?.file.name ?? "لا يوجد"}</span>
        </div>

        <ImageViewer imageUrl={imageState?.previewUrl ?? null} transformStyle={transformStyle} />
      </section>
    </main>
  );
}
