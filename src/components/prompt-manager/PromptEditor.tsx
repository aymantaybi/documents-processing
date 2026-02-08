import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SchemaBuilder } from './SchemaBuilder';
import { Prompt, JSONSchema } from '@/types';
import { useStore } from '@/store';
import { savePrompt, getPrompt } from '@/services/storage/prompts';
import { createDefaultSchema } from '@/services/validation/schema';
import { isValidJsonSchema } from '@/services/validation/validator';
import { generateColumnsFromSchema } from '@/utils/schemaToColumns';
import toast from 'react-hot-toast';

interface PromptEditorProps {
  promptId: string | null;
  onSaved: () => void;
  onCancel: () => void;
}

export const PromptEditor = ({ promptId, onSaved, onCancel }: PromptEditorProps) => {
  const addPrompt = useStore((state) => state.addPrompt);
  const updatePrompt = useStore((state) => state.updatePrompt);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [schema, setSchema] = useState<JSONSchema>(createDefaultSchema());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (promptId) {
      getPrompt(promptId).then((prompt) => {
        if (prompt) {
          setName(prompt.name);
          setDescription(prompt.description || '');
          setSystemPrompt(prompt.systemPrompt);
          setSchema(prompt.jsonSchema);
        }
      });
    } else {
      // Reset for new prompt
      setName('');
      setDescription('');
      setSystemPrompt('');
      setSchema(createDefaultSchema());
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

    if (!isValidJsonSchema(schema)) {
      newErrors.schema = 'Invalid JSON schema format';
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
      // Auto-generate columns from schema
      const columns = generateColumnsFromSchema(schema);

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
          <Label>JSON Schema *</Label>
          <SchemaBuilder schema={schema} onChange={setSchema} />
          {errors.schema && (
            <p className="text-sm text-destructive">{errors.schema}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Define the structure of data to extract. Table columns will be generated automatically from the schema.
          </p>
        </div>
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
