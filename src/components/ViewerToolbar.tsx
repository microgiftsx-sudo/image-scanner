"use client";

type ViewerToolbarProps = {
  disabled?: boolean;
  onRotateClockwise: () => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

export function ViewerToolbar({
  disabled = false,
  onRotateClockwise,
  onFlipHorizontal,
  onFlipVertical,
  onZoomIn,
  onZoomOut,
  onReset,
}: ViewerToolbarProps) {
  return (
    <div className="toolbar">
      <button type="button" onClick={onRotateClockwise} disabled={disabled}>
        تدوير
      </button>
      <button type="button" onClick={onFlipHorizontal} disabled={disabled}>
        قلب أفقي
      </button>
      <button type="button" onClick={onFlipVertical} disabled={disabled}>
        قلب عمودي
      </button>
      <button type="button" onClick={onZoomIn} disabled={disabled}>
        تكبير +
      </button>
      <button type="button" onClick={onZoomOut} disabled={disabled}>
        تصغير -
      </button>
      <button type="button" onClick={onReset} disabled={disabled}>
        إعادة ضبط
      </button>
    </div>
  );
}
