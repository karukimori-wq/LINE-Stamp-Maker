import type { Stamp } from './stamp';

export interface IdeaInput {
  rawIdea: string;
  target: string;
  usageScene: string;
  mood: string;
  notes: string;
}

export interface Concept {
  concept: string;
  characterDirection: string;
  designStyle: string;
  usageScene: string;
  dialogueDirection: string;
  differentiation: string;
}

export interface Character {
  name: string;
  type: string;
  personality: string;
  appearance: string;
  clothing: string;
  mainColor: string;
  artStyle: string;
  features: string;
  negativePrompt: string;
}

export interface Project {
  id: string;
  name: string;
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  idea: IdeaInput;
  concept: Concept;
  character: Character;
  stamps: Stamp[];
}
