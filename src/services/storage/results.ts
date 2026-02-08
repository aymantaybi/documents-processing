import { getDB } from './db';
import { ExtractedData } from '@/types';

export const saveResult = async (result: ExtractedData): Promise<void> => {
  const db = await getDB();
  await db.put('results', result);
};

export const getResults = async (): Promise<ExtractedData[]> => {
  const db = await getDB();
  return await db.getAll('results');
};

export const getResult = async (
  documentId: string
): Promise<ExtractedData | undefined> => {
  const db = await getDB();
  return await db.get('results', documentId);
};

export const updateResult = async (
  documentId: string,
  updates: Partial<ExtractedData>
): Promise<void> => {
  const db = await getDB();
  const result = await db.get('results', documentId);
  if (result) {
    await db.put('results', { ...result, ...updates });
  }
};

export const updateResultEditedData = async (
  documentId: string,
  editedData: Record<string, unknown>
): Promise<void> => {
  const db = await getDB();
  const result = await db.get('results', documentId);
  if (result) {
    await db.put('results', { ...result, editedData });
  }
};

export const deleteResult = async (documentId: string): Promise<void> => {
  const db = await getDB();
  await db.delete('results', documentId);
};

export const deleteAllResults = async (): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('results', 'readwrite');
  await tx.objectStore('results').clear();
  await tx.done;
};
