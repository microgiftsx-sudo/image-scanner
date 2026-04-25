"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { ImageTransforms } from "@/types/image";

const INITIAL_TRANSFORMS: ImageTransforms = {
  rotation: 0,
  scale: 1,
  flipX: false,
  flipY: false,
};

const ZOOM_STEP = 0.1;
const MIN_SCALE = 0.2;
const MAX_SCALE = 3;

export function useImageTransforms() {
  const [transforms, setTransforms] = useState<ImageTransforms>(INITIAL_TRANSFORMS);

  const rotateClockwise = () => {
    setTransforms((current) => ({ ...current, rotation: current.rotation + 90 }));
  };

  const toggleFlipX = () => {
    setTransforms((current) => ({ ...current, flipX: !current.flipX }));
  };

  const toggleFlipY = () => {
    setTransforms((current) => ({ ...current, flipY: !current.flipY }));
  };

  const zoomIn = () => {
    setTransforms((current) => ({
      ...current,
      scale: Math.min(MAX_SCALE, Number((current.scale + ZOOM_STEP).toFixed(2))),
    }));
  };

  const zoomOut = () => {
    setTransforms((current) => ({
      ...current,
      scale: Math.max(MIN_SCALE, Number((current.scale - ZOOM_STEP).toFixed(2))),
    }));
  };

  const reset = () => {
    setTransforms(INITIAL_TRANSFORMS);
  };

  const transformStyle = useMemo<CSSProperties>(() => {
    const xScale = transforms.flipX ? -transforms.scale : transforms.scale;
    const yScale = transforms.flipY ? -transforms.scale : transforms.scale;

    return {
      transform: `rotate(${transforms.rotation}deg) scale(${xScale}, ${yScale})`,
      transition: "transform 180ms ease",
    };
  }, [transforms]);

  return {
    transforms,
    transformStyle,
    actions: {
      rotateClockwise,
      toggleFlipX,
      toggleFlipY,
      zoomIn,
      zoomOut,
      reset,
    },
  };
}
