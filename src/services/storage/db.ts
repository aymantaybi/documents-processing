import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Document, Prompt, ExtractedData } from '@/types';

export interface DocumentsDB extends DBSchema {
  documents: {
    key: string;
    value: Document;
    indexes: { 'by-status': string; 'by-date': Date };
  };
  prompts: {
    key: string;
    value: Prompt;
    indexes: { 'by-name': string; 'by-date': Date };
  };
  results: {
    key: string;
    value: ExtractedData;
    indexes: { 'by-document': string };
  };
}

let dbInstance: IDBPDatabase<DocumentsDB> | null = null;

export const initDB = async (): Promise<IDBPDatabase<DocumentsDB>> => {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<DocumentsDB>('documents-processing-db', 1, {
    upgrade(db) {
      // Documents store
      if (!db.objectStoreNames.contains('documents')) {
        const docStore = db.createObjectStore('documents', { keyPath: 'id' });
        docStore.createIndex('by-status', 'status');
        docStore.createIndex('by-date', 'uploadedAt');
      }

      // Prompts store
      if (!db.objectStoreNames.contains('prompts')) {
        const promptStore = db.createObjectStore('prompts', { keyPath: 'id' });
        promptStore.createIndex('by-name', 'name');
        promptStore.createIndex('by-date', 'createdAt');
      }

      // Results store
      if (!db.objectStoreNames.contains('results')) {
        const resultStore = db.createObjectStore('results', {
          keyPath: 'documentId',
        });
        resultStore.createIndex('by-document', 'documentId');
      }
    },
  });

  return dbInstance;
};

export const getDB = async () => {
  if (!dbInstance) {
    return await initDB();
  }
  return dbInstance;
};

export const closeDB = async () => {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
};
