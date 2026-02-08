import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Prompt, JSONSchema, UIConfig } from '@/types';
import { useStore } from '@/store';
import { savePrompt, getPrompt } from '@/services/storage/prompts';
import { createDefaultSchema } from '@/services/validation/schema';
import { isValidJsonSchema } from '@/services/validation/validator';
import toast from 'react-hot-toast';

interface PromptEditorProps {
  promptId: string | null;
  onSaved: () => void;
  onCancel: () => void;
}

const defaultUIConfig: UIConfig = {
  columns: [
    {
      key: 'field1',
      label: 'Field 1',
      editable: true,
      type: 'text',
    },
  ],
  nestedRenderStrategy: 'expandable',
};

export const PromptEditor = ({ promptId, onSaved, onCancel }: PromptEditorProps) => {
  const addPrompt = useStore((state) => state.addPrompt);
  const updatePrompt = useStore((state) => state.updatePrompt);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [schemaText, setSchemaText] = useState(
    JSON.stringify(createDefaultSchema(), null, 2)
  );
  const [columns, setColumns] = useState<UIConfig['columns']>(
    defaultUIConfig.columns
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (promptId) {
      getPrompt(promptId).then((prompt) => {
        if (prompt) {
          setName(prompt.name);
          setDescription(prompt.description || '');
          setSystemPrompt(prompt.systemPrompt);
          setSchemaText(JSON.stringify(prompt.jsonSchema, null, 2));
          setColumns(prompt.uiConfig.columns);
        }
      });
    } else {
      // Reset for new prompt
      setName('');
      setDescription('');
      setSystemPrompt('');
      setSchemaText(JSON.stringify(createDefaultSchema(), null, 2));
      setColumns(defaultUIConfig.columns);
    }
  }, [promptId]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!systemPrompt.trim()) {
      newErrors.systemPrompt = 'System prompt is required';
    }

    try {
      const schema = JSON.parse(schemaText);
      if (!isValidJsonSchema(schema)) {
        newErrors.schema = 'Invalid JSON schema format';
      }
    } catch {
      newErrors.schema = 'Invalid JSON';
    }

    if (columns.length === 0) {
      newErrors.columns = 'At least one column is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Please fix validation errors');
      return;
    }

    try {
      const schema: JSONSchema = JSON.parse(schemaText);

      const prompt: Prompt = {
        id: promptId || `${Date.now()}-${Math.random()}`,
        name: name.trim(),
        description: description.trim() || undefined,
        systemPrompt: systemPrompt.trim(),
        jsonSchema: schema,
        uiConfig: {
          columns,
          nestedRenderStrategy: 'expandable',
        },
        createdAt: promptId ? (await getPrompt(promptId))!.createdAt : new Date(),
        updatedAt: new Date(),
      };

      await savePrompt(prompt);

      if (promptId) {
        updatePrompt(promptId, prompt);
        toast.success('Prompt updated');
      } else {
        addPrompt(prompt);
        toast.success('Prompt created');
      }

      onSaved();
    } catch (error) {
      toast.error('Failed to save prompt');
    }
  };

  const handleAddColumn = () => {
    setColumns([
      ...columns,
      {
        key: '',
        label: '',
        editable: true,
        type: 'text',
      },
    ]);
  };

  const handleUpdateColumn = (index: number, updates: Partial<UIConfig['columns'][0]>) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], ...updates };
    setColumns(newColumns);
  };

  const handleRemoveColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Prompt Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Invoice Data Extraction"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="system-prompt">System Prompt *</Label>
          <Textarea
            id="system-prompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Instructions for AI. e.g., 'Extract all invoice information from the document including invoice number, date, customer details, and line items.'"
            className="min-h-[100px]"
          />
          {errors.systemPrompt && (
            <p className="text-sm text-destructive">{errors.systemPrompt}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="schema">JSON Schema *</Label>
          <Textarea
            id="schema"
            value={schemaText}
            onChange={(e) => setSchemaText(e.target.value)}
            placeholder="JSON schema for the extracted data"
            className="min-h-[200px] font-mono text-xs"
          />
          {errors.schema && (
            <p className="text-sm text-destructive">{errors.schema}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Define the structure of data to extract. Must be a valid JSON Schema with
            type "object".
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Table Columns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {columns.map((column, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Key (e.g., customer.name)"
                    value={column.key}
                    onChange={(e) =>
                      handleUpdateColumn(index, { key: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Label (e.g., Customer Name)"
                    value={column.label}
                    onChange={(e) =>
                      handleUpdateColumn(index, { label: e.target.value })
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveColumn(index)}
                >
                  <span className="text-lg">×</span>
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddColumn}
            >
              Add Column
            </Button>
            {errors.columns && (
              <p className="text-sm text-destructive">{errors.columns}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {promptId ? 'Update' : 'Create'} Prompt
        </Button>
      </div>
    </div>
  );
};
