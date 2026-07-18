export type ImageRecordType = 'character' | 'grid' | 'stamp' | 'animatedStamp' | 'animationFrame' | 'main' | 'tab';

export interface ImageRecord {
  id: string;
  projectId: string;
  type: ImageRecordType;
  stampNumber?: number;
  frameNumber?: number;
  blob: Blob;
  mimeType: string;
  width: number;
  height: number;
  createdAt: string;
}
