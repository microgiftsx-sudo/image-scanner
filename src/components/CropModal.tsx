"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";

type CropSelection = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type HandleType = "top-left" | "top-right" | "bottom-left" | "bottom-right";

type CropModalProps = {
  imageUrl: string;
  initialSelection?: CropSelection | null;
  onClose: () => void;
  onApply: (selection: CropSelection) => void;
};

const MIN_SIZE_PERCENT = 0.1;

export function CropModal({ imageUrl, initialSelection, onClose, onApply }: CropModalProps) {
  const imageAreaRef = useRef<HTMLDivElement | null>(null);
  const [selection, setSelection] = useState<CropSelection>(
    initialSelection ?? { x: 0.2, y: 0.2, width: 0.6, height: 0.6 },
  );
  const dragRef = useRef<{
    handle: HandleType;
    startX: number;
    startY: number;
    initial: CropSelection;
  } | null>(null);

  const selectionStyle = useMemo(
    () => ({
      left: `${selection.x * 100}%`,
      top: `${selection.y * 100}%`,
      width: `${selection.width * 100}%`,
      height: `${selection.height * 100}%`,
    }),
    [selection],
  );

  const updateSelectionFromHandle = (
    handle: HandleType,
    deltaXPercent: number,
    deltaYPercent: number,
    initial: CropSelection,
  ): CropSelection => {
    let { x, y, width, height } = initial;

    if (handle === "top-left") {
      x = initial.x + deltaXPercent;
      y = initial.y + deltaYPercent;
      width = initial.width - deltaXPercent;
      height = initial.height - deltaYPercent;
    } else if (handle === "top-right") {
      y = initial.y + deltaYPercent;
      width = initial.width + deltaXPercent;
      height = initial.height - deltaYPercent;
    } else if (handle === "bottom-left") {
      x = initial.x + deltaXPercent;
      width = initial.width - deltaXPercent;
      height = initial.height + deltaYPercent;
    } else {
      width = initial.width + deltaXPercent;
      height = initial.height + deltaYPercent;
    }

    width = Math.max(MIN_SIZE_PERCENT, width);
    height = Math.max(MIN_SIZE_PERCENT, height);

    x = Math.max(0, Math.min(1 - width, x));
    y = Math.max(0, Math.min(1 - height, y));

    return { x, y, width, height };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>, handle: HandleType) => {
    event.preventDefault();
    event.stopPropagation();

    dragRef.current = {
      handle,
      startX: event.clientX,
      startY: event.clientY,
      initial: selection,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const area = imageAreaRef.current;
    if (!drag || !area) {
      return;
    }

    const rect = area.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }

    const deltaXPercent = (event.clientX - drag.startX) / rect.width;
    const deltaYPercent = (event.clientY - drag.startY) / rect.height;
    setSelection(updateSelectionFromHandle(drag.handle, deltaXPercent, deltaYPercent, drag.initial));
  };

  const stopDrag = () => {
    dragRef.current = null;
  };

  return (
    <div className="cropModalBackdrop" role="dialog" aria-modal="true">
      <div className="cropModalCard">
        <div className="cropModalHeader">
          <h3>قص الصورة</h3>
          <p>اسحب من الزوايا الأربع لتحديد منطقة القص.</p>
        </div>

        <div className="cropImageArea" ref={imageAreaRef} onPointerMove={handlePointerMove} onPointerUp={stopDrag} onPointerLeave={stopDrag}>
          <Image src={imageUrl} alt="Crop preview" fill unoptimized className="cropModalImage" />
          <div className="cropSelection" style={selectionStyle}>
            <button type="button" className="cropHandle cropHandleTopLeft" onPointerDown={(e) => handlePointerDown(e, "top-left")} aria-label="Top left handle" />
            <button type="button" className="cropHandle cropHandleTopRight" onPointerDown={(e) => handlePointerDown(e, "top-right")} aria-label="Top right handle" />
            <button type="button" className="cropHandle cropHandleBottomLeft" onPointerDown={(e) => handlePointerDown(e, "bottom-left")} aria-label="Bottom left handle" />
            <button type="button" className="cropHandle cropHandleBottomRight" onPointerDown={(e) => handlePointerDown(e, "bottom-right")} aria-label="Bottom right handle" />
          </div>
        </div>

        <div className="cropModalActions">
          <button type="button" onClick={onClose}>
            إلغاء
          </button>
          <button type="button" onClick={() => onApply(selection)}>
            تطبيق القص
          </button>
        </div>
      </div>
    </div>
  );
}
