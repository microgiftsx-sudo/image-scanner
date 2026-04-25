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
  const [isDragActive, setIsDragActive] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
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

  const handleSaveImage = async () => {
    if (!imageState?.previewUrl || isSavingImage) {
      return;
    }

    setIsSavingImage(true);

    try {
      const sourceImage = new Image();
      sourceImage.src = imageState.previewUrl;
      await sourceImage.decode();

      const radians = (transforms.rotation * Math.PI) / 180;
      const absCos = Math.abs(Math.cos(radians));
      const absSin = Math.abs(Math.sin(radians));

      const scaledWidth = sourceImage.naturalWidth * transforms.scale;
      const scaledHeight = sourceImage.naturalHeight * transforms.scale;

      const outputWidth = Math.max(1, Math.round(scaledWidth * absCos + scaledHeight * absSin));
      const outputHeight = Math.max(1, Math.round(scaledWidth * absSin + scaledHeight * absCos));

      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("canvas_context_error");
      }

      context.translate(outputWidth / 2, outputHeight / 2);
      context.rotate(radians);
      context.scale(transforms.flipX ? -transforms.scale : transforms.scale, transforms.flipY ? -transforms.scale : transforms.scale);
      context.drawImage(
        sourceImage,
        -sourceImage.naturalWidth / 2,
        -sourceImage.naturalHeight / 2,
        sourceImage.naturalWidth,
        sourceImage.naturalHeight,
      );

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });

      if (!blob) {
        throw new Error("blob_creation_error");
      }

      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `${imageState.file.name.replace(/\.[^/.]+$/, "")}-edited.png`;
      anchor.click();
      URL.revokeObjectURL(downloadUrl);
    } catch {
      setError("تعذر حفظ الصورة بعد التعديلات. حاول مرة أخرى.");
    } finally {
      setIsSavingImage(false);
    }
  };

  return (
    <main className="pageContainer">
      <section className="scannerCard">
        <div className="govHeader">
          <div>
            <p className="sectorTag">منصة الخدمات الرقمية - وحدة المعالجة البصرية</p>
            <h1>نظام فحص الصور</h1>
            <p className="subtitle">
              لوحة تشغيل مؤسسية لمراجعة الصور الواردة واتخاذ إجراءات الفحص الأولية بسرعة ودقة.
            </p>
          </div>
        </div>

        <div className="appGrid">
          <aside className="adminPanel">
            <h2>مركز التحكم</h2>
            <p className="panelHint">إدارة ملف الصورة وأدوات المعاينة من لوحة واحدة.</p>

            <ImageUploader onFileSelected={handleFileSelected} />
            {error ? <p className="errorText">{error}</p> : null}

            <div className="panelSection">
              <h3>أدوات المعالجة</h3>
              <ViewerToolbar
                disabled={!imageState}
                isSaving={isSavingImage}
                onRotateClockwise={actions.rotateClockwise}
                onFlipHorizontal={actions.toggleFlipX}
                onFlipVertical={actions.toggleFlipY}
                onZoomIn={actions.zoomIn}
                onZoomOut={actions.zoomOut}
                onReset={actions.reset}
                onSaveImage={handleSaveImage}
              />
            </div>

            <div className="panelSection">
              <h3>ملخص الحالة</h3>
              <div className="statusRow">
                <span>زاوية الدوران: {transforms.rotation % 360}°</span>
                <span>مستوى التكبير: {scalePercent}</span>
                <span>القلب الأفقي: {transforms.flipX ? "مفعل" : "غير مفعل"}</span>
                <span>القلب العمودي: {transforms.flipY ? "مفعل" : "غير مفعل"}</span>
                <span>الملف الحالي: {imageState?.file.name ?? "لا يوجد"}</span>
              </div>
            </div>
          </aside>

          <section className="viewerPanel">
            <div className="viewerPanelHeader">
              <h2>شاشة المعاينة التشغيلية</h2>
              <p>يتم تطبيق التعديلات بصريًا فورًا دون المساس بالملف الأصلي.</p>
            </div>
            <ImageViewer
              imageUrl={imageState?.previewUrl ?? null}
              transformStyle={transformStyle}
              isDragActive={isDragActive}
              onFileDrop={handleFileSelected}
              onDragStateChange={setIsDragActive}
            />
          </section>
        </div>
      </section>
    </main>
  );
}
