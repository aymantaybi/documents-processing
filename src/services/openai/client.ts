import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export const initializeOpenAI = (apiKey: string): void => {
  openaiClient = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true, // Client-side usage (warn users!)
  });
};

export const getOpenAIClient = (): OpenAI => {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized. Please set your API key in settings.');
  }
  return openaiClient;
};

export const isOpenAIInitialized = (): boolean => {
  return openaiClient !== null;
};

export const resetOpenAIClient = (): void => {
  openaiClient = null;
};
