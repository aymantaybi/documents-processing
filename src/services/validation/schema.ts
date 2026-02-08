import { JSONSchema, JSONSchemaProperty } from '@/types';

export const createDefaultSchema = (): JSONSchema => {
  return {
    type: 'object',
    properties: {
      field1: {
        type: 'string',
        description: 'Example text field',
      },
      field2: {
        type: 'number',
        description: 'Example number field',
      },
    },
    required: ['field1'],
  };
};

export const getSchemaPropertyType = (
  schema: JSONSchema,
  path: string
): JSONSchemaProperty | undefined => {
  const keys = path.split('.');
  let current: any = schema.properties;

  for (const key of keys) {
    if (!current[key]) return undefined;
    if (current[key].type === 'object' && current[key].properties) {
      current = current[key].properties;
    } else {
      return current[key];
    }
  }

  return undefined;
};

export const flattenSchema = (
  schema: JSONSchema,
  prefix: string = ''
): Array<{ path: string; property: JSONSchemaProperty }> => {
  const flattened: Array<{ path: string; property: JSONSchemaProperty }> = [];

  Object.entries(schema.properties).forEach(([key, property]) => {
    const path = prefix ? `${prefix}.${key}` : key;

    if (property.type === 'object' && property.properties) {
      // Recursively flatten nested objects
      const nested = flattenSchema(
        {
          type: 'object',
          properties: property.properties,
        },
        path
      );
      flattened.push(...nested);
    } else {
      flattened.push({ path, property });
    }
  });

  return flattened;
};

export const generateExampleValue = (property: JSONSchemaProperty): unknown => {
  switch (property.type) {
    case 'string':
      return 'example';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'array':
      return [];
    case 'object':
      return {};
    default:
      return null;
  }
};
