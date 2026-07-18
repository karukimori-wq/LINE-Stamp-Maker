import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { ImageRecord } from '@/types/image';
import type { Project, ProjectStampType } from '@/types/project';

export const DB_NAME = 'line-stamp-maker';
const DB_VERSION = 1;

interface SettingRecord {
  key: string;
  value: unknown;
}

interface LineStampMakerDB extends DBSchema {
  projects: {
    key: string;
    value: Project;
    indexes: { 'by-updatedAt': string };
  };
  images: {
    key: string;
    value: ImageRecord;
    indexes: { 'by-projectId': string };
  };
  settings: {
    key: string;
    value: SettingRecord;
  };
}

let dbPromise: Promise<IDBPDatabase<LineStampMakerDB>> | null = null;

function getDb() {
  if (typeof window === 'undefined') throw new Error('IndexedDBはブラウザでのみ利用できます。');
  if (!dbPromise) {
    dbPromise = openDB<LineStampMakerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('projects')) {
          const store = db.createObjectStore('projects', { keyPath: 'id' });
          store.createIndex('by-updatedAt', 'updatedAt');
        }
        if (!db.objectStoreNames.contains('images')) {
          const store = db.createObjectStore('images', { keyPath: 'id' });
          store.createIndex('by-projectId', 'projectId');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

const emptyProject = (name: string, stampType: ProjectStampType = 'static'): Project => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    stampType,
    currentStep: 1,
    createdAt: now,
    updatedAt: now,
    idea: { rawIdea: '', target: '', usageScene: '', mood: '', notes: '' },
    concept: { concept: '', characterDirection: '', designStyle: '', usageScene: '', dialogueDirection: '', differentiation: '' },
    character: { name: '', type: '', personality: '', appearance: '', clothing: '', mainColor: '', artStyle: '', features: '', negativePrompt: '' },
    stamps: [],
  };
};

export async function getProjects(): Promise<Project[]> {
  const db = await getDb();
  const projects = await db.getAll('projects');
  return projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getProject(id: string): Promise<Project | undefined> {
  return (await getDb()).get('projects', id);
}

export async function createProject(name: string, stampType: ProjectStampType = 'static'): Promise<Project> {
  const project = emptyProject(name, stampType);
  await (await getDb()).put('projects', project);
  return project;
}

export async function updateProject(project: Project): Promise<Project> {
  const updated = { ...project, stampType: project.stampType ?? 'static', updatedAt: new Date().toISOString() };
  await (await getDb()).put('projects', updated);
  return updated;
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(['projects', 'images'], 'readwrite');
  await tx.objectStore('projects').delete(id);
  const imageKeys = await tx.objectStore('images').index('by-projectId').getAllKeys(id);
  await Promise.all(imageKeys.map((key) => tx.objectStore('images').delete(key)));
  await tx.done;
}

export async function duplicateProject(id: string): Promise<Project> {
  const db = await getDb();
  const source = await db.get('projects', id);
  if (!source) throw new Error('複製元のプロジェクトが見つかりません。');
  const now = new Date().toISOString();
  const copyId = crypto.randomUUID();
  const copy: Project = { ...structuredClone(source), stampType: source.stampType ?? 'static', id: copyId, name: `${source.name} のコピー`, createdAt: now, updatedAt: now };
  const images = await db.getAllFromIndex('images', 'by-projectId', id);
  const tx = db.transaction(['projects', 'images'], 'readwrite');
  await tx.objectStore('projects').put(copy);
  for (const image of images) {
    await tx.objectStore('images').put({ ...image, id: crypto.randomUUID(), projectId: copyId, createdAt: now });
  }
  await tx.done;
  return copy;
}

export async function saveImage(image: ImageRecord): Promise<void> {
  await (await getDb()).put('images', image);
}

export async function getImagesByProject(projectId: string): Promise<ImageRecord[]> {
  return (await getDb()).getAllFromIndex('images', 'by-projectId', projectId);
}

export async function deleteImage(id: string): Promise<void> {
  await (await getDb()).delete('images', id);
}
