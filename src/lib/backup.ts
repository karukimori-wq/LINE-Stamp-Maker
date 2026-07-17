import { getImagesByProject, getProjects, saveImage, updateProject } from '@/lib/db';
import type { ImageRecord } from '@/types/image';
import type { Project } from '@/types/project';

const SCHEMA_VERSION = 1;

type BackupImage = Omit<ImageRecord, 'blob'> & { base64: string };
type BackupData = { schemaVersion: number; exportedAt: string; projects: Project[]; images: BackupImage[] };

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('画像の読み込みに失敗しました。'));
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',');
  if (!header || !data) throw new Error('バックアップ画像の形式が正しくありません。');
  const mimeType = header.match(/data:(.*?);base64/)?.[1] || 'image/png';
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

export async function createBackup(): Promise<Blob> {
  const projects = await getProjects();
  const images: BackupImage[] = [];
  for (const project of projects) {
    const projectImages = await getImagesByProject(project.id);
    for (const image of projectImages) {
      const { blob, ...meta } = image;
      images.push({ ...meta, base64: await blobToBase64(blob) });
    }
  }
  const data: BackupData = { schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), projects, images };
  return new Blob([JSON.stringify(data)], { type: 'application/json' });
}

export async function restoreBackup(file: File): Promise<{ projects: number; images: number }> {
  let data: BackupData;
  try { data = JSON.parse(await file.text()) as BackupData; }
  catch { throw new Error('バックアップファイルを読み込めませんでした。'); }
  if (data.schemaVersion !== SCHEMA_VERSION) throw new Error(`未対応のバックアップ形式です。schemaVersion: ${data.schemaVersion}`);
  if (!Array.isArray(data.projects) || !Array.isArray(data.images)) throw new Error('バックアップデータの構造が正しくありません。');
  for (const project of data.projects) await updateProject(project);
  for (const image of data.images) {
    const { base64, ...meta } = image;
    await saveImage({ ...meta, blob: base64ToBlob(base64) });
  }
  return { projects: data.projects.length, images: data.images.length };
}

export function downloadBackup(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
