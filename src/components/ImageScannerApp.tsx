"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { CropModal } from "@/components/CropModal";
import { ImageViewer } from "@/components/ImageViewer";
import { ViewerToolbar } from "@/components/ViewerToolbar";
import { useImageTransforms } from "@/hooks/useImageTransforms";
import { validateImageFile } from "@/lib/fileValidation";
import type { ImageFileState } from "@/types/image";

type CropSelection = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function ImageScannerApp() {
  const [imageState, setImageState] = useState<ImageFileState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropSelection, setCropSelection] = useState<CropSelection | null>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
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
    setPanOffset({ x: 0, y: 0 });
    setCropSelection(null);
    setIsCropModalOpen(false);

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

  const handleWheelZoom = (deltaY: number) => {
    if (!imageState) {
      return;
    }

    if (deltaY < 0) {
      actions.zoomIn();
      return;
    }

    actions.zoomOut();
  };

  const handlePanStart = (x: number, y: number) => {
    if (!imageState) {
      return;
    }

    setIsPanning(true);
    panStartRef.current = {
      x: x - panOffset.x,
      y: y - panOffset.y,
    };
  };

  const handlePanMove = (x: number, y: number) => {
    if (!isPanning) {
      return;
    }

    setPanOffset({
      x: x - panStartRef.current.x,
      y: y - panStartRef.current.y,
    });
  };

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  const handleResetAll = () => {
    actions.reset();
    setPanOffset({ x: 0, y: 0 });
    setCropSelection(null);
    setIsCropModalOpen(false);
  };

  const handleOpenCropModal = () => {
    if (!imageState) {
      return;
    }

    setIsCropModalOpen(true);
  };

  const handleApplyCrop = async (selection: CropSelection) => {
    if (!imageState?.previewUrl) {
      return;
    }

    try {
      const sourceImage = new Image();
      sourceImage.src = imageState.previewUrl;
      await sourceImage.decode();

      const sourceX = Math.round(sourceImage.naturalWidth * selection.x);
      const sourceY = Math.round(sourceImage.naturalHeight * selection.y);
      const sourceWidth = Math.max(1, Math.round(sourceImage.naturalWidth * selection.width));
      const sourceHeight = Math.max(1, Math.round(sourceImage.naturalHeight * selection.height));

      const canvas = document.createElement("canvas");
      canvas.width = sourceWidth;
      canvas.height = sourceHeight;

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("canvas_context_error");
      }

      context.drawImage(
        sourceImage,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        sourceWidth,
        sourceHeight,
      );

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });

      if (!blob) {
        throw new Error("blob_creation_error");
      }

      const croppedFile = new File(
        [blob],
        `${imageState.file.name.replace(/\.[^/.]+$/, "")}-crop.png`,
        { type: "image/png" },
      );

      setImageState((current) => {
        if (current?.previewUrl) {
          URL.revokeObjectURL(current.previewUrl);
        }

        return {
          file: croppedFile,
          previewUrl: URL.createObjectURL(croppedFile),
        };
      });

      actions.reset();
      setPanOffset({ x: 0, y: 0 });
      setCropSelection(selection);
      setIsCropModalOpen(false);
      setError(null);
    } catch {
      setError("تعذر تطبيق القص. حاول تحديد المنطقة مرة أخرى.");
    }
  };

  const mergedTransformStyle = useMemo<CSSProperties>(() => {
    const translate = `translate(${panOffset.x}px, ${panOffset.y}px)`;
    const baseTransform = typeof transformStyle.transform === "string" ? transformStyle.transform : "";

    return {
      ...transformStyle,
      transform: `${translate} ${baseTransform}`.trim(),
      transition: isPanning ? "none" : "transform 180ms ease",
    };
  }, [transformStyle, panOffset, isPanning]);

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
                scale={transforms.scale}
                rotation={transforms.rotation}
                flipX={transforms.flipX}
                flipY={transforms.flipY}
                onScaleChange={actions.setScale}
                onRotationChange={actions.setRotation}
                onFlipXChange={actions.setFlipX}
                onFlipYChange={actions.setFlipY}
                onOpenCrop={handleOpenCropModal}
                onReset={handleResetAll}
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
                <span>الإزاحة: X {Math.round(panOffset.x)} / Y {Math.round(panOffset.y)}</span>
                <span>وضع القص: {isCropModalOpen ? "مفتوح" : "غير مفتوح"}</span>
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
              transformStyle={mergedTransformStyle}
              isDragActive={isDragActive}
              isPanning={isPanning}
              onFileDrop={handleFileSelected}
              onDragStateChange={setIsDragActive}
              onWheelZoom={handleWheelZoom}
              onPanStart={handlePanStart}
              onPanMove={handlePanMove}
              onPanEnd={handlePanEnd}
            />
          </section>
        </div>
      </section>
      {isCropModalOpen && imageState?.previewUrl ? (
        <CropModal
          imageUrl={imageState.previewUrl}
          initialSelection={cropSelection}
          onClose={() => setIsCropModalOpen(false)}
          onApply={handleApplyCrop}
        />
      ) : null}
    </main>
  );
}
