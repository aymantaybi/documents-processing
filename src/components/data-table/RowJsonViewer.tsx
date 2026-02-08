import { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';

interface RowJsonViewerProps {
  data: unknown;
  path: string[];
  editable: boolean;
  onSave: (path: string[], value: unknown) => void;
  depth?: number;
  parentKey?: string;
}

export const RowJsonViewer = ({
  data,
  path,
  editable,
  onSave,
  depth = 0,
  parentKey,
}: RowJsonViewerProps) => {
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

  // Null/undefined
  if (data === null || data === undefined) {
    return (
      <div className="flex items-center min-h-10 px-4 border-b hover:bg-accent/30 transition-colors">
        <span className="font-medium text-sm w-48 flex-shrink-0 text-muted-foreground py-2">
          {parentKey}
        </span>
        <span className="text-sm italic text-muted-foreground py-2 flex-1">
          {data === null ? 'null' : 'undefined'}
        </span>
      </div>
    );
  }

  // Primitives
  if (typeof data !== 'object') {
    return (
      <div className="group flex items-center min-h-10 px-4 border-b hover:bg-accent/30 transition-colors">
        <span className="font-medium text-sm w-48 flex-shrink-0 text-muted-foreground py-2">
          {parentKey}
        </span>
        {isEditing ? (
          <Input
            ref={inputRef}
            type={typeof data === 'number' ? 'number' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="h-7 py-0 text-sm flex-1 max-w-md"
          />
        ) : (
          <span
            className={cn(
              'text-sm font-mono flex-1 min-w-0 break-words py-2',
              typeof data === 'string' && 'text-green-700 dark:text-green-400',
              typeof data === 'number' && 'text-blue-700 dark:text-blue-400',
              typeof data === 'boolean' && 'text-purple-700 dark:text-purple-400'
            )}
            onDoubleClick={editable ? handleEdit : undefined}
            title={editable ? 'Double-click to edit' : undefined}
          >
            {formatDisplay(data)}
          </span>
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

  return (
    <>
      {/* Parent Row */}
      {depth > 0 && (
        <div
          className="group flex items-center min-h-10 px-4 border-b hover:bg-accent/30 transition-colors cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0 py-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className="font-medium text-sm w-44 flex-shrink-0 text-muted-foreground">
              {parentKey}
            </span>
            <span className="text-sm text-muted-foreground font-mono">
              {isArray ? `Array[${entries.length}]` : `Object{${entries.length}}`}
            </span>
          </div>
        </div>
      )}

      {/* Child Rows */}
      {(isExpanded || depth === 0) && (
        <>
          {isEmpty ? (
            <div className="flex items-center min-h-10 px-4 border-b bg-muted/20">
              <span
                className="text-sm text-muted-foreground italic py-2"
                style={{ paddingLeft: `${(depth + 1) * 1.5}rem` }}
              >
                Empty {isArray ? 'array' : 'object'}
              </span>
            </div>
          ) : (
            entries.map(([key, value]) => (
              <div key={key} style={{ paddingLeft: `${depth * 1.5}rem` }}>
                <RowJsonViewer
                  data={value}
                  path={[...path, key]}
                  editable={editable}
                  onSave={onSave}
                  depth={depth + 1}
                  parentKey={isArray ? `[${key}]` : key}
                />
              </div>
            ))
          )}
        </>
      )}
    </>
  );
};

// Helper functions
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
