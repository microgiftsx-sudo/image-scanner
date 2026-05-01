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
  const iconSize = 18;

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

      <div className="iconToggleGroup">
        <button
          type="button"
          className={`iconToggleButton ${flipX ? "active" : ""}`}
          onClick={() => onFlipXChange(!flipX)}
          disabled={disabled}
          aria-pressed={flipX}
        >
          <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} aria-hidden="true">
            <path
              d="M4 12h6m0 0-2.5-2.5M10 12 7.5 14.5M14 6h6v12h-6zM12 4v16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>قلب أفقي</span>
        </button>

        <button
          type="button"
          className={`iconToggleButton ${flipY ? "active" : ""}`}
          onClick={() => onFlipYChange(!flipY)}
          disabled={disabled}
          aria-pressed={flipY}
        >
          <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} aria-hidden="true">
            <path
              d="M12 4v6m0 0-2.5-2.5M12 10l2.5-2.5M6 14h12v6H6zM4 12h16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>قلب عمودي</span>
        </button>
      </div>

      <div className="toolbar">
        <button type="button" onClick={onReset} disabled={disabled}>
          إعادة ضبط
        </button>
        <button type="button" onClick={onSaveImage} disabled={disabled || isSaving}>
          {isSaving ? "جاري الحفظ..." : "حفظ الصورة"}
        </button>
        <button type="button" onClick={onOpenCrop} disabled={disabled}>
          <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} aria-hidden="true">
            <path
              d="M6 3v12a3 3 0 0 0 3 3h12M18 21V9a3 3 0 0 0-3-3H3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>قص</span>
        </button>
      </div>
    </div>
  );
}
