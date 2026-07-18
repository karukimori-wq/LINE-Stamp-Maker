export interface Stamp {
  id: string;
  number: number;
  text: string;
  emotion: string;
  expression: string;
  pose: string;
  situation: string;
  startPose?: string;
  motion?: string;
  endPose?: string;
  loop?: string;
  frameCount?: string;
}
