import { JSONSchema } from './prompt';

export interface SchemaValidationResult {
  valid: boolean;
  errors?: SchemaValidationError[];
}

export interface SchemaValidationError {
  instancePath: string;
  message: string;
  keyword: string;
  params?: Record<string, unknown>;
}

export interface SchemaEditorProps {
  schema: JSONSchema;
  onChange: (schema: JSONSchema) => void;
}

export interface UIConfigEditorProps {
  uiConfig: {
    columns: Array<{
      key: string;
      label: string;
      editable: boolean;
      type: 'text' | 'number' | 'date' | 'nested' | 'boolean';
    }>;
    nestedRenderStrategy: 'inline' | 'expandable' | 'modal';
  };
  onChange: (uiConfig: any) => void;
  schema: JSONSchema;
}
