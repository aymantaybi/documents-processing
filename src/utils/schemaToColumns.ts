import { JSONSchema, ColumnConfig, JSONSchemaProperty } from '@/types';

/**
 * Converts a property name to a human-readable label
 * e.g., "invoice_number" -> "Invoice Number"
 */
const formatLabel = (key: string): string => {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Maps JSON Schema type to column display type
 */
const mapSchemaTypeToColumnType = (
  schemaType: string
): ColumnConfig['type'] => {
  switch (schemaType) {
    case 'string':
      return 'text';
    case 'number':
    case 'integer':
      return 'number';
    case 'boolean':
      return 'text';
    case 'object':
    case 'array':
      return 'nested';
    default:
      return 'text';
  }
};

/**
 * Recursively generates columns from schema properties, including nested paths
 */
const generateColumnsRecursive = (
  properties: Record<string, JSONSchemaProperty>,
  parentKey: string = ''
): ColumnConfig[] => {
  const columns: ColumnConfig[] = [];

  Object.entries(properties).forEach(([key, property]) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    const label = formatLabel(key);

    // Add the field itself
    columns.push({
      key: fullKey,
      label: parentKey ? `${formatLabel(parentKey)} > ${label}` : label,
      editable: true,
      type: mapSchemaTypeToColumnType(property.type),
    });

    // Recursively add nested object properties
    if (property.type === 'object' && property.properties) {
      const nestedColumns = generateColumnsRecursive(property.properties, fullKey);
      columns.push(...nestedColumns);
    }

    // For arrays of objects, add their properties with array notation
    if (property.type === 'array' && property.items) {
      const items = property.items as JSONSchemaProperty;
      if (items.type === 'object' && items.properties) {
        const arrayItemColumns = generateColumnsRecursive(items.properties, fullKey);
        columns.push(...arrayItemColumns);
      }
    }
  });

  return columns;
};

/**
 * Auto-generates table columns from JSON Schema
 * Includes nested object properties as separate columns with dotted paths
 */
export const generateColumnsFromSchema = (
  schema: JSONSchema
): ColumnConfig[] => {
  if (!schema.properties) {
    return [];
  }

  return generateColumnsRecursive(schema.properties);
};
