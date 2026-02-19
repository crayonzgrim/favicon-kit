import sharp from "sharp";
import pngToIco from "png-to-ico";
import type { Options } from "./validation";

const BASE_SIZE = 1024;
export const EXPORT_SIZES = [16, 32, 48, 180, 192, 512] as const;
export type ExportSize = (typeof EXPORT_SIZES)[number];

export type IconBuffers = Record<ExportSize, Buffer> & { ico: Buffer };

export async function buildBase(input: Buffer, options: Options): Promise<Buffer> {
  const paddingPct = Math.max(0, Math.min(0.2, options.paddingPct));
  const innerSize = Math.round(BASE_SIZE * (1 - 2 * paddingPct));

  // Create base canvas
  const bgIsTransparent = options.background === "transparent";
  const base = sharp({
    create: {
      width: BASE_SIZE,
      height: BASE_SIZE,
      channels: 4,
      background: bgIsTransparent
        ? { r: 0, g: 0, b: 0, alpha: 0 }
        : hexToRgba(options.background as string),
    },
  }).png();

  // Resize input image to fit innerSize
  const resized = await sharp(input)
    .resize(innerSize, innerSize, {
      fit: options.fit === "cover" ? "cover" : "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();

  // Get actual dimensions of resized image for centering
  const resizedMeta = await sharp(resized).metadata();
  const rw = resizedMeta.width ?? innerSize;
  const rh = resizedMeta.height ?? innerSize;

  const left = Math.round((BASE_SIZE - rw) / 2);
  const top = Math.round((BASE_SIZE - rh) / 2);

  // Composite resized onto base
  return base
    .composite([{ input: resized, left, top }])
    .png()
    .toBuffer();
}

export async function exportSizes(base: Buffer): Promise<Map<ExportSize, Buffer>> {
  const results = new Map<ExportSize, Buffer>();

  await Promise.all(
    EXPORT_SIZES.map(async (size) => {
      const buf = await sharp(base)
        .resize(size, size, { kernel: sharp.kernel.lanczos3 })
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toBuffer();
      results.set(size, buf);
    })
  );

  return results;
}

export async function buildIco(pngs: Map<ExportSize, Buffer>): Promise<Buffer> {
  const inputs = [pngs.get(16)!, pngs.get(32)!, pngs.get(48)!];
  const ico = await pngToIco(inputs);
  return Buffer.from(ico);
}

export async function generateAllIcons(
  input: Buffer,
  options: Options
): Promise<IconBuffers> {
  const base = await buildBase(input, options);
  const pngs = await exportSizes(base);
  const ico = await buildIco(pngs);

  return {
    16: pngs.get(16)!,
    32: pngs.get(32)!,
    48: pngs.get(48)!,
    180: pngs.get(180)!,
    192: pngs.get(192)!,
    512: pngs.get(512)!,
    ico,
  };
}

function hexToRgba(hex: string): { r: number; g: number; b: number; alpha: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
    alpha: 1,
  };
}
