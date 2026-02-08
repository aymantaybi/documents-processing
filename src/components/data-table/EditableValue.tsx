import { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

interface EditableValueProps {
  value: unknown;
  path: string[];
  editable: boolean;
  onSave: (path: string[], value: unknown) => void;
  depth?: number;
  maxDepth?: number;
}

export const EditableValue = ({
  value,
  path,
  editable,
  onSave,
  depth = 0,
  maxDepth = 5,
}: EditableValueProps) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle primitive value editing
  const handleDoubleClick = () => {
    if (!editable) return;
    if (typeof value === 'object' && value !== null) return; // Don't edit objects directly
    setEditValue(formatPrimitiveValue(value));
    setIsEditing(true);
  };

  const handleSave = () => {
    const newValue = parsePrimitiveValue(editValue, value);
    onSave(path, newValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  // Handle object/array modifications
  const handleAddProperty = () => {
    if (!editable) return;
    const key = prompt('Property name:');
    if (!key) return;

    const newObj = { ...(value as Record<string, unknown>), [key]: '' };
    onSave(path, newObj);
  };

  const handleAddArrayItem = () => {
    if (!editable) return;
    const newArray = [...(value as unknown[]), ''];
    onSave(path, newArray);
  };

  const handleRemoveProperty = (key: string) => {
    if (!editable) return;
    const { [key]: removed, ...rest } = value as Record<string, unknown>;
    onSave(path, rest);
  };

  const handleRemoveArrayItem = (index: number) => {
    if (!editable) return;
    const newArray = [...(value as unknown[])];
    newArray.splice(index, 1);
    onSave(path, newArray);
  };

  // Null/undefined rendering
  if (value === null || value === undefined) {
    return (
      <span
        className={cn(
          'text-muted-foreground italic text-sm',
          editable && 'cursor-pointer hover:bg-muted/50 px-2 py-1 rounded'
        )}
        onDoubleClick={handleDoubleClick}
        title={editable ? 'Double-click to edit' : undefined}
      >
        {value === null ? 'null' : 'undefined'}
      </span>
    );
  }

  // Primitive value editing
  if (typeof value !== 'object') {
    if (isEditing) {
      return (
        <Input
          ref={inputRef}
          type={typeof value === 'number' ? 'number' : 'text'}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="h-7 py-0 text-sm max-w-xs"
        />
      );
    }

    return (
      <span
        className={cn(
          'text-sm py-1',
          editable && 'cursor-pointer hover:bg-muted/50 px-2 rounded inline-block',
          typeof value === 'boolean' && (value ? 'text-green-600' : 'text-red-600'),
          typeof value === 'number' && 'text-blue-600'
        )}
        onDoubleClick={handleDoubleClick}
        title={editable ? 'Double-click to edit' : undefined}
      >
        {formatPrimitiveValue(value)}
      </span>
    );
  }

  // Max depth check
  if (depth >= maxDepth) {
    return <span className="text-muted-foreground text-xs">[max depth reached]</span>;
  }

  // Array rendering
  if (Array.isArray(value)) {
    const isEmpty = value.length === 0;

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            <span className="text-muted-foreground font-mono">
              [{value.length} {value.length === 1 ? 'item' : 'items'}]
            </span>
          </button>
          {editable && (
            <Button
              size="icon"
              variant="ghost"
              className="h-5 w-5"
              onClick={handleAddArrayItem}
              title="Add item"
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>
        {isExpanded && (
          <div className="ml-4 pl-3 border-l-2 border-muted space-y-2">
            {isEmpty ? (
              <span className="text-xs text-muted-foreground italic">Empty array</span>
            ) : (
              value.map((item, index) => (
                <div key={index} className="flex items-start gap-2 group">
                  <div className="flex-1 flex items-start gap-2">
                    <span className="text-muted-foreground text-xs font-mono min-w-[2rem] pt-1">
                      [{index}]
                    </span>
                    <div className="flex-1">
                      <EditableValue
                        value={item}
                        path={[...path, String(index)]}
                        editable={editable}
                        onSave={onSave}
                        depth={depth + 1}
                        maxDepth={maxDepth}
                      />
                    </div>
                  </div>
                  {editable && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveArrayItem(index)}
                      title="Remove item"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  // Object rendering
  const entries = Object.entries(value as Record<string, unknown>);
  const isEmpty = entries.length === 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          <span className="text-muted-foreground font-mono">
            {'{'}
            {entries.length} {entries.length === 1 ? 'field' : 'fields'}
            {'}'}
          </span>
        </button>
        {editable && (
          <Button
            size="icon"
            variant="ghost"
            className="h-5 w-5"
            onClick={handleAddProperty}
            title="Add property"
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>
      {isExpanded && (
        <div className="ml-4 pl-3 border-l-2 border-muted space-y-2">
          {isEmpty ? (
            <span className="text-xs text-muted-foreground italic">Empty object</span>
          ) : (
            entries.map(([key, val]) => (
              <div key={key} className="flex items-start gap-2 group">
                <div className="flex-1 flex items-start gap-2">
                  <span className="text-muted-foreground text-sm font-medium min-w-[6rem] pt-1">
                    {key}:
                  </span>
                  <div className="flex-1">
                    <EditableValue
                      value={val}
                      path={[...path, key]}
                      editable={editable}
                      onSave={onSave}
                      depth={depth + 1}
                      maxDepth={maxDepth}
                    />
                  </div>
                </div>
                {editable && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveProperty(key)}
                    title="Remove property"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Helper functions
function formatPrimitiveValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  return String(value);
}

function parsePrimitiveValue(input: string, originalValue: unknown): unknown {
  // Try to preserve the original type
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

  // For strings and everything else
  return input;
}
