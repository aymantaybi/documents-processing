export interface Prompt {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  jsonSchema: JSONSchema;
  uiConfig: UIConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface JSONSchema {
  type: 'object';
  properties: Record<string, JSONSchemaProperty>;
  required?: string[];
}

export interface JSONSchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';
  description?: string;
  properties?: Record<string, JSONSchemaProperty>; // For nested objects
  required?: string[]; // For nested objects
  items?: JSONSchemaProperty; // For arrays
  enum?: Array<string | number>; // For enum types
  format?: string; // For date, email, etc.
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
}

export type NestedRenderStrategy = 'inline' | 'expandable' | 'modal';

export interface UIConfig {
  columns: ColumnConfig[];
  nestedRenderStrategy: NestedRenderStrategy;
}

export type ColumnType = 'text' | 'number' | 'date' | 'nested' | 'boolean';

export interface ColumnConfig {
  key: string; // JSON path (e.g., "customer.name")
  label: string;
  width?: number;
  editable: boolean;
  type: ColumnType;
  format?: string; // For dates, numbers
}
