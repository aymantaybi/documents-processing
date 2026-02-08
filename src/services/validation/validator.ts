import Ajv, { ErrorObject } from 'ajv';
import { JSONSchema, SchemaValidationResult, SchemaValidationError } from '@/types';

const ajv = new Ajv({ allErrors: true, verbose: true });

export const validateAgainstSchema = (
  data: unknown,
  schema: JSONSchema
): SchemaValidationResult => {
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (!valid && validate.errors) {
    const errors: SchemaValidationError[] = validate.errors.map(
      (err: ErrorObject) => ({
        instancePath: err.instancePath || '/',
        message: err.message || 'Validation error',
        keyword: err.keyword,
        params: err.params,
      })
    );

    return {
      valid: false,
      errors,
    };
  }

  return { valid: true };
};

export const validateFieldValue = (
  value: unknown,
  fieldSchema: any
): { valid: boolean; error?: string } => {
  const schema = {
    type: 'object',
    properties: {
      field: fieldSchema,
    },
    required: ['field'],
  };

  const result = validateAgainstSchema({ field: value }, schema as JSONSchema);

  if (!result.valid && result.errors) {
    return {
      valid: false,
      error: result.errors[0]?.message || 'Validation failed',
    };
  }

  return { valid: true };
};

export const isValidJsonSchema = (schema: unknown): boolean => {
  if (typeof schema !== 'object' || schema === null) return false;

  const s = schema as any;

  // Basic JSON Schema validation
  if (s.type !== 'object') return false;
  if (!s.properties || typeof s.properties !== 'object') return false;

  return true;
};
