export type ImageRecordType = 'character' | 'grid' | 'stamp' | 'animatedStamp' | 'main' | 'tab';

export interface ImageRecord {
  id: string;
  projectId: string;
  type: ImageRecordType;
  stampNumber?: number;
  blob: Blob;
  mimeType: string;
  width: number;
  height: number;
  createdAt: string;
}
