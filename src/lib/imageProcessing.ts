export async function blobToImage(blob: Blob): Promise<ImageBitmap> {
  try { return await createImageBitmap(blob, { imageOrientation: 'from-image' }); }
  catch { return await createImageBitmap(blob); }
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png', quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('画像の生成に失敗しました。')), type, quality));
}

export async function splitGridImage(blob: Blob): Promise<Array<{ blob: Blob; width: number; height: number }>> {
  const image = await blobToImage(blob);
  const results: Array<{ blob: Blob; width: number; height: number }> = [];
  try {
    for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
      const x0 = Math.round((image.width * col) / 3), x1 = Math.round((image.width * (col + 1)) / 3);
      const y0 = Math.round((image.height * row) / 3), y1 = Math.round((image.height * (row + 1)) / 3);
      const width = x1 - x0, height = y1 - y0;
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvasを利用できません。');
      ctx.drawImage(image, x0, y0, width, height, 0, 0, width, height);
      results.push({ blob: await canvasToBlob(canvas), width, height });
    }
    return results;
  } finally { image.close(); }
}

export async function resizeImage(blob: Blob, targetWidth: number, targetHeight: number): Promise<Blob> {
  const image = await blobToImage(blob);
  try {
    const canvas = document.createElement('canvas'); canvas.width = targetWidth; canvas.height = targetHeight;
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvasを利用できません。');
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
    return await canvasToBlob(canvas);
  } finally { image.close(); }
}
