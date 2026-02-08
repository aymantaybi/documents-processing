import { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Edit2,
  Plus,
  X,
  Package,
  List,
  Hash,
  Type,
  ToggleLeft,
  FileJson,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface JsonViewerProps {
  data: unknown;
  path: string[];
  editable: boolean;
  onSave: (path: string[], value: unknown) => void;
  depth?: number;
  parentKey?: string;
}

export const JsonViewer = ({
  data,
  path,
  editable,
  onSave,
  depth = 0,
  parentKey,
}: JsonViewerProps) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleCopy = () => {
    const text = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    if (!editable || typeof data === 'object') return;
    setEditValue(formatValue(data));
    setIsEditing(true);
  };

  const handleSave = () => {
    const newValue = parseValue(editValue, data);
    onSave(path, newValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') setIsEditing(false);
  };

  const handleAddProperty = () => {
    if (!editable) return;
    const key = prompt('Property name:');
    if (!key) return;
    const newObj = { ...(data as Record<string, unknown>), [key]: '' };
    onSave(path, newObj);
  };

  const handleAddArrayItem = () => {
    if (!editable) return;
    const newArray = [...(data as unknown[]), ''];
    onSave(path, newArray);
  };

  const handleRemove = (key: string | number) => {
    if (!editable) return;
    if (Array.isArray(data)) {
      const newArray = [...data];
      newArray.splice(key as number, 1);
      onSave(path, newArray);
    } else {
      const { [key]: removed, ...rest } = data as Record<string, unknown>;
      onSave(path, rest);
    }
  };

  // Null/undefined
  if (data === null || data === undefined) {
    return (
      <div className="flex items-center gap-2 py-1">
        {parentKey && (
          <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
            {parentKey}:
          </span>
        )}
        <span className="text-sm text-gray-500 italic">
          {data === null ? 'null' : 'undefined'}
        </span>
      </div>
    );
  }

  // Primitives
  if (typeof data !== 'object') {
    const Icon = getTypeIcon(typeof data);
    const color = getTypeColor(typeof data);

    return (
      <div className="group flex items-center gap-2 py-1 hover:bg-accent/50 rounded px-2 -mx-2 transition-colors">
        {parentKey && (
          <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
            {parentKey}:
          </span>
        )}
        <Icon className={cn('h-3.5 w-3.5 flex-shrink-0', color)} />
        {isEditing ? (
          <Input
            ref={inputRef}
            type={typeof data === 'number' ? 'number' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="h-7 py-0 text-sm flex-1"
          />
        ) : (
          <span
            className={cn('text-sm font-mono flex-1', color)}
            onDoubleClick={editable ? handleEdit : undefined}
            title={editable ? 'Double-click to edit' : undefined}
          >
            {formatDisplay(data)}
          </span>
        )}
        {editable && !isEditing && (
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleEdit}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  // Arrays and Objects
  const isArray = Array.isArray(data);
  const entries = isArray
    ? (data as unknown[]).map((item, idx) => [String(idx), item] as [string, unknown])
    : Object.entries(data as Record<string, unknown>);

  const isEmpty = entries.length === 0;
  const Icon = isArray ? List : Package;
  const openBracket = isArray ? '[' : '{';
  const closeBracket = isArray ? ']' : '}';

  return (
    <div className="space-y-0.5">
      <div
        className={cn(
          'group flex items-center gap-2 py-1 hover:bg-accent/50 rounded px-2 -mx-2 transition-colors',
          depth > 0 && 'cursor-pointer'
        )}
        onClick={() => depth > 0 && setIsExpanded(!isExpanded)}
      >
        {depth > 0 && (
          <button className="flex-shrink-0 hover:bg-accent rounded p-0.5 transition-colors">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        )}

        {parentKey && (
          <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
            {parentKey}:
          </span>
        )}

        <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />

        <span className="text-sm font-mono text-muted-foreground">
          {openBracket}
          {!isExpanded && (
            <span className="mx-1 text-xs">
              {entries.length} {isArray ? 'items' : 'properties'}
            </span>
          )}
          {!isExpanded && closeBracket}
        </span>

        <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            title="Copy JSON"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
          {editable && (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                isArray ? handleAddArrayItem() : handleAddProperty();
              }}
              title={isArray ? 'Add item' : 'Add property'}
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className={cn('ml-4 pl-4 border-l-2 border-border/40 space-y-0.5', depth === 0 && 'ml-0 pl-0 border-l-0')}>
          {isEmpty ? (
            <div className="py-2 px-2 text-xs text-muted-foreground italic">
              Empty {isArray ? 'array' : 'object'}
            </div>
          ) : (
            entries.map(([key, value]) => (
              <div key={key} className="relative group/item">
                <JsonViewer
                  data={value}
                  path={[...path, key]}
                  editable={editable}
                  onSave={onSave}
                  depth={depth + 1}
                  parentKey={isArray ? `[${key}]` : key}
                />
                {editable && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover/item:opacity-100 transition-opacity"
                    onClick={() => handleRemove(isArray ? parseInt(key) : key)}
                    title="Remove"
                  >
                    <X className="h-3 w-3 text-destructive" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {isExpanded && (
        <div className="text-sm font-mono text-muted-foreground px-2">
          {closeBracket}
        </div>
      )}
    </div>
  );
};

// Helper functions
function getTypeIcon(type: string) {
  switch (type) {
    case 'string':
      return Type;
    case 'number':
      return Hash;
    case 'boolean':
      return ToggleLeft;
    default:
      return FileJson;
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case 'string':
      return 'text-green-700 dark:text-green-400';
    case 'number':
      return 'text-blue-700 dark:text-blue-400';
    case 'boolean':
      return 'text-purple-700 dark:text-purple-400';
    default:
      return 'text-gray-700 dark:text-gray-400';
  }
}

function formatValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

function formatDisplay(value: unknown): string {
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  return formatValue(value);
}

function parseValue(input: string, originalValue: unknown): unknown {
  if (typeof originalValue === 'number') {
    const num = parseFloat(input);
    return isNaN(num) ? originalValue : num;
  }

  if (typeof originalValue === 'boolean') {
    const lower = input.toLowerCase();
    if (lower === 'true' || lower === 'yes' || lower === '1') return true;
    if (lower === 'false' || lower === 'no' || lower === '0') return false;
    return originalValue;
  }

  return input;
}
