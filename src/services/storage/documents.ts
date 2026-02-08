import { getDB } from './db';
import { Document, DocumentStatus } from '@/types';

export const saveDocument = async (doc: Document): Promise<void> => {
  const db = await getDB();
  await db.put('documents', doc);
};

export const getDocuments = async (): Promise<Document[]> => {
  const db = await getDB();
  return await db.getAll('documents');
};

export const getDocument = async (id: string): Promise<Document | undefined> => {
  const db = await getDB();
  return await db.get('documents', id);
};

export const getDocumentsByStatus = async (
  status: DocumentStatus
): Promise<Document[]> => {
  const db = await getDB();
  return await db.getAllFromIndex('documents', 'by-status', status);
};

export const updateDocument = async (
  id: string,
  updates: Partial<Document>
): Promise<void> => {
  const db = await getDB();
  const doc = await db.get('documents', id);
  if (doc) {
    await db.put('documents', { ...doc, ...updates });
  }
};

export const deleteDocument = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('documents', id);
  // Also delete associated result
  try {
    await db.delete('results', id);
  } catch (error) {
    // Result might not exist, that's ok
  }
};

export const deleteAllDocuments = async (): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('documents', 'readwrite');
  await tx.objectStore('documents').clear();
  await tx.done;
};
