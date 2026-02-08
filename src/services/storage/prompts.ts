import { getDB } from './db';
import { Prompt } from '@/types';

export const savePrompt = async (prompt: Prompt): Promise<void> => {
  const db = await getDB();
  await db.put('prompts', prompt);
};

export const getPrompts = async (): Promise<Prompt[]> => {
  const db = await getDB();
  return await db.getAll('prompts');
};

export const getPrompt = async (id: string): Promise<Prompt | undefined> => {
  const db = await getDB();
  return await db.get('prompts', id);
};

export const updatePrompt = async (
  id: string,
  updates: Partial<Prompt>
): Promise<void> => {
  const db = await getDB();
  const prompt = await db.get('prompts', id);
  if (prompt) {
    await db.put('prompts', {
      ...prompt,
      ...updates,
      updatedAt: new Date(),
    });
  }
};

export const deletePrompt = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('prompts', id);
};

export const deleteAllPrompts = async (): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('prompts', 'readwrite');
  await tx.objectStore('prompts').clear();
  await tx.done;
};

export const searchPromptsByName = async (query: string): Promise<Prompt[]> => {
  const db = await getDB();
  const allPrompts = await db.getAll('prompts');
  return allPrompts.filter((prompt) =>
    prompt.name.toLowerCase().includes(query.toLowerCase())
  );
};
