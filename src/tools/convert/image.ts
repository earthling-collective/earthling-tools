// Canvas decode/encode helpers shared by the image tools

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode"));
    img.src = src;
  });
}

export async function loadImageFile(file: File) {
  const url = URL.createObjectURL(file);
  try {
    return await loadImage(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// toBlob silently falls back to PNG for formats the browser cannot write, so compare the type back
export async function encodeCanvas(canvas: HTMLCanvasElement, mime: string, quality?: number) {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));
  if (!blob || blob.type !== mime) throw new Error("unsupported");
  return blob;
}

// Probe once per tool mount: which of these formats this browser can actually encode
export async function encodableMimes(mimes: string[]) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const results = await Promise.all(
    mimes.map(async (mime) => {
      try {
        await encodeCanvas(canvas, mime, 0.5);
        return true;
      } catch {
        return false;
      }
    }),
  );
  return new Set(mimes.filter((_, i) => results[i]));
}

export const baseName = (name: string) => name.split(".").slice(0, -1).join(".") || name;
