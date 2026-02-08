import { getOpenAIClient } from './client';
import { getRateLimiter } from './rateLimit';
import { JSONSchema } from '@/types';
import { ProcessingError } from '@/utils/error';

export interface ProcessDocumentOptions {
  imageData: string[]; // Base64 images
  systemPrompt: string;
  jsonSchema: JSONSchema;
  rateLimit?: number; // requests per minute
}

export const processDocument = async (
  options: ProcessDocumentOptions
): Promise<Record<string, unknown>> => {
  const { imageData, systemPrompt, jsonSchema, rateLimit = 10 } = options;

  // Wait for rate limit slot
  const rateLimiter = getRateLimiter(rateLimit);
  await rateLimiter.waitForSlot();

  try {
    const client = getOpenAIClient();

    // Prepare messages with images
    const content: any[] = imageData.map((img) => ({
      type: 'image_url',
      image_url: {
        url: img,
      },
    }));

    const schemaInstruction = `\n\nYou must respond with valid JSON matching this schema:\n${JSON.stringify(
      jsonSchema,
      null,
      2
    )}`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt + schemaInstruction,
        },
        {
          role: 'user',
          content,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4096,
    });

    const resultContent = response.choices[0]?.message?.content;
    if (!resultContent) {
      throw new ProcessingError('No response content from OpenAI');
    }

    const result = JSON.parse(resultContent);
    return result;
  } catch (error: any) {
    if (error instanceof ProcessingError) {
      throw error;
    }

    // Handle OpenAI API errors
    if (error.status === 401) {
      throw new ProcessingError('Invalid API key', { originalError: error });
    } else if (error.status === 429) {
      throw new ProcessingError('Rate limit exceeded', { originalError: error });
    } else if (error.status === 400) {
      throw new ProcessingError('Bad request to OpenAI API', {
        originalError: error,
      });
    }

    throw new ProcessingError('Failed to process document', {
      originalError: error,
    });
  }
};

export interface BatchProcessOptions {
  documents: Array<{
    id: string;
    imageData: string[];
  }>;
  systemPrompt: string;
  jsonSchema: JSONSchema;
  rateLimit?: number;
  onProgress?: (documentId: string, progress: number) => void;
  onDocumentComplete?: (documentId: string, result: Record<string, unknown>) => void;
  onDocumentError?: (documentId: string, error: Error) => void;
}

export const batchProcessDocuments = async (
  options: BatchProcessOptions
): Promise<Map<string, Record<string, unknown>>> => {
  const {
    documents,
    systemPrompt,
    jsonSchema,
    rateLimit,
    onProgress,
    onDocumentComplete,
    onDocumentError,
  } = options;

  const results = new Map<string, Record<string, unknown>>();
  const total = documents.length;

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];

    try {
      onProgress?.(doc.id, (i / total) * 100);

      const result = await processDocument({
        imageData: doc.imageData,
        systemPrompt,
        jsonSchema,
        rateLimit,
      });

      results.set(doc.id, result);
      onDocumentComplete?.(doc.id, result);
    } catch (error) {
      onDocumentError?.(doc.id, error as Error);
    }
  }

  return results;
};
