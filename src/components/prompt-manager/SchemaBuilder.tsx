import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { JSONSchema, JSONSchemaProperty } from '@/types';

interface SchemaBuilderProps {
  schema: JSONSchema;
  onChange: (schema: JSONSchema) => void;
}

interface FieldConfig {
  name: string;
  property: JSONSchemaProperty;
  required: boolean;
  nested?: FieldConfig[]; // For object properties
  arrayItems?: FieldConfig[]; // For array item schema
}

// Recursively parse JSON Schema into FieldConfig structure
const parseSchemaToFields = (
  properties: Record<string, JSONSchemaProperty>,
  required: string[] = []
): FieldConfig[] => {
  const result: FieldConfig[] = [];
  Object.entries(properties).forEach(([name, prop]) => {
    const field: FieldConfig = {
      name,
      property: { ...prop },
      required: required.includes(name),
    };

    // Handle nested objects
    if (prop.type === 'object' && prop.properties) {
      field.nested = parseSchemaToFields(
        prop.properties,
        prop.required || []
      );
      // Remove properties and required from the property object to avoid duplication
      const { properties: _, required: __, ...cleanProp } = prop;
      field.property = cleanProp as JSONSchemaProperty;
    }

    // Handle arrays with object items
    if (prop.type === 'array' && prop.items) {
      const items = prop.items as JSONSchemaProperty;
      if (items.type === 'object' && items.properties) {
        field.arrayItems = parseSchemaToFields(
          items.properties,
          items.required || []
        );
        // Keep a simplified items reference without nested properties
        const { properties: _, required: __, ...cleanItems } = items;
        field.property = {
          ...prop,
          items: cleanItems as JSONSchemaProperty,
        };
      }
    }

    result.push(field);
  });
  return result;
};

// Helper to remove undefined values from an object
const cleanObject = <T extends Record<string, any>>(obj: T): T => {
  const cleaned: any = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  });
  return cleaned as T;
};

// Recursively convert FieldConfig structure back to JSON Schema
const fieldsToSchema = (fields: FieldConfig[]): { properties: Record<string, JSONSchemaProperty>; required: string[] } => {
  const properties: Record<string, JSONSchemaProperty> = {};
  const required: string[] = [];

  fields.forEach((field) => {
    if (!field.name.trim()) return;

    let property: JSONSchemaProperty = { ...field.property };

    // Handle nested objects
    if (field.property.type === 'object' && field.nested) {
      const nestedSchema = fieldsToSchema(field.nested);
      property = cleanObject({
        ...property,
        properties: nestedSchema.properties,
        required: nestedSchema.required.length > 0 ? nestedSchema.required : undefined,
      }) as JSONSchemaProperty;
    }

    // Handle arrays with object items
    if (field.property.type === 'array' && field.arrayItems) {
      const itemsSchema = fieldsToSchema(field.arrayItems);
      property = cleanObject({
        ...property,
        items: cleanObject({
          type: 'object' as const,
          properties: itemsSchema.properties,
          required: itemsSchema.required.length > 0 ? itemsSchema.required : undefined,
        }) as JSONSchemaProperty,
      }) as JSONSchemaProperty;
    }

    // Clean the final property object of any undefined values
    properties[field.name] = cleanObject(property) as JSONSchemaProperty;
    if (field.required) {
      required.push(field.name);
    }
  });

  return { properties, required };
};

export const SchemaBuilder = ({ schema, onChange }: SchemaBuilderProps) => {
  const { t } = useTranslation('prompt');
  const [fields, setFields] = useState<FieldConfig[]>(() =>
    parseSchemaToFields(schema.properties || {}, schema.required || [])
  );

  const [mode, setMode] = useState<'builder' | 'json'>('builder');
  const [jsonText, setJsonText] = useState(JSON.stringify(schema, null, 2));

  // Track if the change is coming from within this component
  const isInternalChangeRef = useRef(false);
  const prevSchemaRef = useRef(schema);

  // Update fields when schema prop changes externally (for editing existing prompts)
  useEffect(() => {
    // Skip if the change was triggered by this component
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      prevSchemaRef.current = schema;
      return;
    }

    // Only update if schema actually changed
    if (JSON.stringify(prevSchemaRef.current) !== JSON.stringify(schema)) {
      const newFields = parseSchemaToFields(schema.properties || {}, schema.required || []);
      setFields(newFields);
      setJsonText(JSON.stringify(schema, null, 2));
      prevSchemaRef.current = schema;
    }
  }, [schema]);

  const updateSchema = (newFields: FieldConfig[]) => {
    const { properties, required } = fieldsToSchema(newFields);

    const newSchema: JSONSchema = {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
    };

    // Mark this as an internal change
    isInternalChangeRef.current = true;
    onChange(newSchema);
    setJsonText(JSON.stringify(newSchema, null, 2));
  };

  const addField = () => {
    const newFields: FieldConfig[] = [
      ...fields,
      {
        name: '',
        property: { type: 'string' as const },
        required: false,
      },
    ];
    setFields(newFields);
  };

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
    updateSchema(newFields);
  };

  const updateField = (index: number, updates: Partial<FieldConfig>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
    updateSchema(newFields);
  };

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      if (parsed.type === 'object' && parsed.properties) {
        // Mark this as an internal change
        isInternalChangeRef.current = true;
        onChange(parsed);
        // Update fields from JSON
        const newFields = parseSchemaToFields(
          parsed.properties,
          parsed.required || []
        );
        setFields(newFields);
      }
    } catch {
      // Invalid JSON, don't update
    }
  };

  return (
    <Tabs value={mode} onValueChange={(v) => setMode(v as 'builder' | 'json')}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="builder">{t('schema.builder')}</TabsTrigger>
        <TabsTrigger value="json">{t('schema.json')}</TabsTrigger>
      </TabsList>

      <TabsContent value="builder" className="space-y-4">
        <div className="space-y-3">
          {fields.map((field, index) => (
            <FieldEditor
              key={index}
              field={field}
              onUpdate={(updates) => updateField(index, updates)}
              onRemove={() => removeField(index)}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addField}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('schema.addField')}
        </Button>

        {fields.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {t('schema.noFieldsYet')}
          </div>
        )}
      </TabsContent>

      <TabsContent value="json">
        <Textarea
          value={jsonText}
          onChange={(e) => handleJsonChange(e.target.value)}
          className="font-mono text-xs min-h-[400px]"
          placeholder="JSON Schema"
        />
      </TabsContent>
    </Tabs>
  );
};

interface FieldEditorProps {
  field: FieldConfig;
  onUpdate: (updates: Partial<FieldConfig>) => void;
  onRemove: () => void;
  depth?: number;
}

const FieldEditor = ({ field, onUpdate, onRemove, depth = 0 }: FieldEditorProps) => {
  const { t } = useTranslation('prompt');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showNested, setShowNested] = useState(true);

  const typeOptions: Array<JSONSchemaProperty['type']> = [
    'string',
    'number',
    'boolean',
    'object',
    'array',
  ];

  const formatOptions: Record<string, string[]> = {
    string: ['none', 'date', 'date-time', 'email', 'uri'],
    number: ['none', 'int32', 'int64', 'float', 'double'],
  };

  const arrayItemTypeOptions: Array<JSONSchemaProperty['type']> = [
    'string',
    'number',
    'boolean',
    'object',
  ];

  // Handlers for nested object properties
  const handleAddNestedProperty = () => {
    const newNested = [
      ...(field.nested || []),
      {
        name: '',
        property: { type: 'string' as const },
        required: false,
      },
    ];
    onUpdate({ nested: newNested });
  };

  const handleUpdateNestedProperty = (index: number, updates: Partial<FieldConfig>) => {
    const newNested = [...(field.nested || [])];
    newNested[index] = { ...newNested[index], ...updates };
    onUpdate({ nested: newNested });
  };

  const handleRemoveNestedProperty = (index: number) => {
    const newNested = (field.nested || []).filter((_, i) => i !== index);
    onUpdate({ nested: newNested });
  };

  // Handlers for array items
  const handleAddArrayItem = () => {
    const newItems = [
      ...(field.arrayItems || []),
      {
        name: '',
        property: { type: 'string' as const },
        required: false,
      },
    ];
    onUpdate({ arrayItems: newItems });
  };

  const handleUpdateArrayItem = (index: number, updates: Partial<FieldConfig>) => {
    const newItems = [...(field.arrayItems || [])];
    newItems[index] = { ...newItems[index], ...updates };
    onUpdate({ arrayItems: newItems });
  };

  const handleRemoveArrayItem = (index: number) => {
    const newItems = (field.arrayItems || []).filter((_, i) => i !== index);
    onUpdate({ arrayItems: newItems });
  };

  const handleArrayItemTypeChange = (type: JSONSchemaProperty['type']) => {
    if (type === 'object') {
      // Initialize with empty nested properties for object items
      onUpdate({
        property: {
          ...field.property,
          items: { type: 'object' as const },
        },
        arrayItems: [],
      });
    } else {
      // Simple array type
      onUpdate({
        property: {
          ...field.property,
          items: { type },
        },
        arrayItems: undefined,
      });
    }
  };

  const getArrayItemType = (): JSONSchemaProperty['type'] => {
    if (field.property.items) {
      return (field.property.items as JSONSchemaProperty).type;
    }
    return 'string';
  };

  const bgColor = depth === 0 ? 'bg-background' : depth === 1 ? 'bg-muted/30' : 'bg-muted/50';

  return (
    <Card className={bgColor} style={{ marginLeft: `${depth * 16}px` }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <div className="flex-1 grid grid-cols-3 gap-2">
              <Input
                placeholder={t('schema.fieldNamePlaceholder')}
                value={field.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="h-8"
              />
              <Select
                value={field.property.type}
                onValueChange={(type) =>
                  onUpdate({
                    property: {
                      ...field.property,
                      type: type as JSONSchemaProperty['type'],
                    },
                  })
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => onUpdate({ required: e.target.checked })}
                  className="rounded"
                />
                {t('schema.required')}
              </label>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-3 pt-0">
          <div className="space-y-2">
            <Label className="text-xs">{t('schema.fieldDescription')}</Label>
            <Input
              placeholder={t('schema.fieldDescriptionPlaceholder')}
              value={field.property.description || ''}
              onChange={(e) =>
                onUpdate({
                  property: { ...field.property, description: e.target.value },
                })
              }
              className="h-8 text-xs"
            />
          </div>

          {(field.property.type === 'string' || field.property.type === 'number') && (
            <div className="space-y-2">
              <Label className="text-xs">{t('schema.format')}</Label>
              <Select
                value={field.property.format || 'none'}
                onValueChange={(format) =>
                  onUpdate({
                    property: {
                      ...field.property,
                      format: format === 'none' ? undefined : format,
                    },
                  })
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions[field.property.type]?.map((fmt) => (
                    <SelectItem key={fmt} value={fmt}>
                      {fmt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {field.property.type === 'string' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-xs">{t('schema.minLength')}</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={field.property.minLength || ''}
                  onChange={(e) =>
                    onUpdate({
                      property: {
                        ...field.property,
                        minLength: e.target.value ? parseInt(e.target.value) : undefined,
                      },
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('schema.maxLength')}</Label>
                <Input
                  type="number"
                  placeholder="∞"
                  value={field.property.maxLength || ''}
                  onChange={(e) =>
                    onUpdate({
                      property: {
                        ...field.property,
                        maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                      },
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>
            </div>
          )}

          {field.property.type === 'number' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-xs">{t('schema.minimum')}</Label>
                <Input
                  type="number"
                  placeholder="-∞"
                  value={field.property.minimum || ''}
                  onChange={(e) =>
                    onUpdate({
                      property: {
                        ...field.property,
                        minimum: e.target.value ? parseFloat(e.target.value) : undefined,
                      },
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{t('schema.maximum')}</Label>
                <Input
                  type="number"
                  placeholder="∞"
                  value={field.property.maximum || ''}
                  onChange={(e) =>
                    onUpdate({
                      property: {
                        ...field.property,
                        maximum: e.target.value ? parseFloat(e.target.value) : undefined,
                      },
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>
            </div>
          )}

          {field.property.type === 'object' && (
            <div className="space-y-3 border-l-2 border-primary/20 pl-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">{t('schema.objectProperties')}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNested(!showNested)}
                  className="h-6 text-xs"
                >
                  {showNested ? (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      {t('schema.hide')}
                    </>
                  ) : (
                    <>
                      <ChevronRight className="h-3 w-3 mr-1" />
                      {t('schema.show')}
                    </>
                  )}
                </Button>
              </div>

              {showNested && (
                <>
                  <div className="space-y-2">
                    {(field.nested || []).map((nestedField, index) => (
                      <FieldEditor
                        key={index}
                        field={nestedField}
                        onUpdate={(updates) => handleUpdateNestedProperty(index, updates)}
                        onRemove={() => handleRemoveNestedProperty(index)}
                        depth={depth + 1}
                      />
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddNestedProperty}
                    className="w-full h-7 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {t('schema.addProperty')}
                  </Button>

                  {(!field.nested || field.nested.length === 0) && (
                    <div className="text-center py-4 text-xs text-muted-foreground">
                      {t('schema.noProperties')}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {field.property.type === 'array' && (
            <div className="space-y-3 border-l-2 border-primary/20 pl-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">{t('schema.arrayItemType')}</Label>
                <Select
                  value={getArrayItemType()}
                  onValueChange={(type) => handleArrayItemTypeChange(type as JSONSchemaProperty['type'])}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {arrayItemTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {getArrayItemType() === 'object' && (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">{t('schema.itemProperties')}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNested(!showNested)}
                      className="h-6 text-xs"
                    >
                      {showNested ? (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          {t('schema.hide')}
                        </>
                      ) : (
                        <>
                          <ChevronRight className="h-3 w-3 mr-1" />
                          {t('schema.show')}
                        </>
                      )}
                    </Button>
                  </div>

                  {showNested && (
                    <>
                      <div className="space-y-2">
                        {(field.arrayItems || []).map((itemField, index) => (
                          <FieldEditor
                            key={index}
                            field={itemField}
                            onUpdate={(updates) => handleUpdateArrayItem(index, updates)}
                            onRemove={() => handleRemoveArrayItem(index)}
                            depth={depth + 1}
                          />
                        ))}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddArrayItem}
                        className="w-full h-7 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {t('schema.addProperty')}
                      </Button>

                      {(!field.arrayItems || field.arrayItems.length === 0) && (
                        <div className="text-center py-4 text-xs text-muted-foreground">
                          {t('schema.noProperties')}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
