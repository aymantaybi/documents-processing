import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';
import { ColumnType } from '@/types';

interface EditableCellProps {
  value: unknown;
  type: ColumnType;
  editable: boolean;
  onSave: (value: unknown) => void;
  format?: string;
}

export const EditableCell = ({ value, type, editable, onSave, format }: EditableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const formatValue = (val: unknown): string => {
    if (val === null || val === undefined) return '';

    if (type === 'date' && typeof val === 'string') {
      try {
        const date = new Date(val);
        if (format === 'short') {
          return date.toLocaleDateString();
        }
        return date.toLocaleString();
      } catch {
        return String(val);
      }
    }

    if (type === 'number' && typeof val === 'number') {
      if (format) {
        return val.toLocaleString(undefined, {
          minimumFractionDigits: format === 'currency' ? 2 : 0,
          maximumFractionDigits: format === 'currency' ? 2 : 2,
        });
      }
      return val.toString();
    }

    if (type === 'boolean') {
      return val ? 'Yes' : 'No';
    }

    return String(val);
  };

  const handleDoubleClick = () => {
    if (!editable) return;
    setEditValue(formatValue(value));
    setIsEditing(true);
  };

  const handleSave = () => {
    let newValue: unknown = editValue;

    // Convert based on type
    if (type === 'number') {
      newValue = parseFloat(editValue);
      if (isNaN(newValue as number)) {
        newValue = value; // Revert on invalid
      }
    } else if (type === 'boolean') {
      newValue = editValue.toLowerCase() === 'true' || editValue.toLowerCase() === 'yes';
    } else if (type === 'date') {
      try {
        newValue = new Date(editValue).toISOString();
      } catch {
        newValue = value; // Revert on invalid
      }
    }

    onSave(newValue);
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

  if (type === 'nested') {
    return (
      <div className="text-xs text-muted-foreground">
        {value ? '[Object]' : '—'}
      </div>
    );
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type={type === 'number' ? 'number' : type === 'date' ? 'datetime-local' : 'text'}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="h-8 py-0"
      />
    );
  }

  return (
    <div
      className={cn(
        'min-h-[2rem] flex items-center',
        editable && 'cursor-pointer hover:bg-muted/50 px-2 -mx-2 rounded'
      )}
      onDoubleClick={handleDoubleClick}
      title={editable ? 'Double-click to edit' : undefined}
    >
      {formatValue(value)}
    </div>
  );
};
