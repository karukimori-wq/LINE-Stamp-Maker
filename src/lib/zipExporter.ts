import JSZip from 'jszip';

export interface ExportImage { name: string; blob: Blob }

export async function createStampZip(images: ExportImage[]): Promise<Blob> {
  const zip = new JSZip();
  for (const image of images) zip.file(image.name, image.blob);
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function shareOrDownload(blob: Blob, filename: string): Promise<'shared'|'downloaded'> {
  const file = new File([blob], filename, { type: 'application/zip' });
  if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
    try { await navigator.share({ files: [file], title: 'LINE Stamp Maker 出力データ' }); return 'shared'; }
    catch (error) { if (error instanceof DOMException && error.name === 'AbortError') throw error; }
  }
  downloadBlob(blob, filename); return 'downloaded';
}
