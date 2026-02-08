export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: any, key: string) => current?.[key], obj);
}

export function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): Record<string, unknown> {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current: any, key: string) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
  return obj;
}

export function isJsonString(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

export function prettyPrintJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}
