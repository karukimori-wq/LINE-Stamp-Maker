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
    // Every output frame must have exactly the same dimensions for APNG encoding.
    // Source dimensions are not always divisible by 3 (for example 1024px), so
    // using rounded crop boundaries can produce a mix of 341px and 342px frames.
    // We keep full source coverage in the crop, but normalize every crop into a
    // common canvas size based on the largest cell.
    const xBounds = [0, Math.round(image.width / 3), Math.round((image.width * 2) / 3), image.width];
    const yBounds = [0, Math.round(image.height / 3), Math.round((image.height * 2) / 3), image.height];
    const targetWidth = Math.max(xBounds[1] - xBounds[0], xBounds[2] - xBounds[1], xBounds[3] - xBounds[2]);
    const targetHeight = Math.max(yBounds[1] - yBounds[0], yBounds[2] - yBounds[1], yBounds[3] - yBounds[2]);

    for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
      const x0 = xBounds[col], x1 = xBounds[col + 1];
      const y0 = yBounds[row], y1 = yBounds[row + 1];
      const sourceWidth = x1 - x0, sourceHeight = y1 - y0;
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth; canvas.height = targetHeight;
      const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvasを利用できません。');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.clearRect(0, 0, targetWidth, targetHeight);
      ctx.drawImage(image, x0, y0, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight);
      results.push({ blob: await canvasToBlob(canvas), width: targetWidth, height: targetHeight });
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
