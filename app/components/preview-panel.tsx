"use client";

import { useRef, useEffect, useCallback } from "react";
import type { Options } from "@/app/lib/validation";

type PreviewPanelProps = {
  file: File | null;
  options: Options;
};

const PREVIEW_CONFIGS = [
  { label: "Tab 16px", size: 16, display: 32 },
  { label: "Tab 32px", size: 32, display: 48 },
  { label: "iOS 180px", size: 180, display: 80 },
  { label: "Android 192px", size: 192, display: 80 },
  { label: "Android 512px", size: 512, display: 120 },
] as const;

export function PreviewPanel({ file, options }: PreviewPanelProps) {
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const renderPreviews = useCallback(() => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        for (const config of PREVIEW_CONFIGS) {
          const canvas = canvasRefs.current.get(config.size);
          if (!canvas) continue;
          renderToCanvas(canvas, img, options);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }, [file, options]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(renderPreviews, 150);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [renderPreviews]);

  const setCanvasRef = useCallback(
    (size: number) => (el: HTMLCanvasElement | null) => {
      if (el) canvasRefs.current.set(size, el);
      else canvasRefs.current.delete(size);
    },
    []
  );

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 p-12 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
        <p className="text-sm text-zinc-400">
          Upload an image to see preview
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
        Preview
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {PREVIEW_CONFIGS.map((config) => (
          <div
            key={config.size}
            className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50"
          >
            <div
              className="flex items-center justify-center overflow-hidden rounded-lg"
              style={{
                width: config.display,
                height: config.display,
                backgroundImage:
                  "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                backgroundSize: "12px 12px",
                backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0px",
              }}
            >
              <canvas
                ref={setCanvasRef(config.size)}
                width={config.display}
                height={config.display}
                className="block"
              />
            </div>
            <span className="text-xs text-zinc-500">{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderToCanvas(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  options: Options
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Background
  if (options.background !== "transparent") {
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, w, h);
  }

  // Calculate inner area with padding
  const paddingPct = Math.max(0, Math.min(0.2, options.paddingPct));
  const innerSize = Math.round(w * (1 - 2 * paddingPct));
  const offset = Math.round((w - innerSize) / 2);

  // Draw image
  if (options.fit === "cover") {
    const imgAspect = img.width / img.height;
    let sx: number, sy: number, sw: number, sh: number;

    if (imgAspect > 1) {
      sh = img.height;
      sw = img.height;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      sw = img.width;
      sh = img.width;
      sx = 0;
      sy = (img.height - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, offset, offset, innerSize, innerSize);
  } else {
    // contain
    const imgAspect = img.width / img.height;
    let dw: number, dh: number;

    if (imgAspect > 1) {
      dw = innerSize;
      dh = Math.round(innerSize / imgAspect);
    } else {
      dh = innerSize;
      dw = Math.round(innerSize * imgAspect);
    }

    const dx = offset + Math.round((innerSize - dw) / 2);
    const dy = offset + Math.round((innerSize - dh) / 2);

    ctx.drawImage(img, dx, dy, dw, dh);
  }
}
