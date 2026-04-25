"use client";

type ViewerToolbarProps = {
  disabled?: boolean;
  isSaving?: boolean;
  scale: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  onScaleChange: (value: number) => void;
  onRotationChange: (value: number) => void;
  onFlipXChange: (enabled: boolean) => void;
  onFlipYChange: (enabled: boolean) => void;
  onOpenCrop: () => void;
  onReset: () => void;
  onSaveImage: () => void;
};

export function ViewerToolbar({
  disabled = false,
  isSaving = false,
  scale,
  rotation,
  flipX,
  flipY,
  onScaleChange,
  onRotationChange,
  onFlipXChange,
  onFlipYChange,
  onOpenCrop,
  onReset,
  onSaveImage,
}: ViewerToolbarProps) {
  return (
    <div className="toolbarWrap">
      <div className="sliderGroup">
        <label>
          التكبير: {Math.round(scale * 100)}%
          <input
            type="range"
            min={20}
            max={300}
            step={1}
            value={Math.round(scale * 100)}
            onChange={(event) => onScaleChange(Number(event.target.value) / 100)}
            disabled={disabled}
          />
        </label>

        <label>
          الدوران: {Math.round(rotation)}°
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={Math.round(rotation)}
            onChange={(event) => onRotationChange(Number(event.target.value))}
            disabled={disabled}
          />
        </label>
      </div>

      <div className="checkboxGroup">
        <label className="checkboxRow">
          <input
            type="checkbox"
            checked={flipX}
            onChange={(event) => onFlipXChange(event.target.checked)}
            disabled={disabled}
          />
          <span>القلب الأفقي: {flipX ? "مفعل" : "غير مفعل"}</span>
        </label>

        <label className="checkboxRow">
          <input
            type="checkbox"
            checked={flipY}
            onChange={(event) => onFlipYChange(event.target.checked)}
            disabled={disabled}
          />
          <span>القلب العمودي: {flipY ? "مفعل" : "غير مفعل"}</span>
        </label>
      </div>

      <div className="toolbar">
        <button type="button" onClick={onReset} disabled={disabled}>
          إعادة ضبط
        </button>
        <button type="button" onClick={onSaveImage} disabled={disabled || isSaving}>
          {isSaving ? "جاري الحفظ..." : "حفظ الصورة"}
        </button>
        <button type="button" onClick={onOpenCrop} disabled={disabled}>
          قص
        </button>
      </div>
    </div>
  );
}
