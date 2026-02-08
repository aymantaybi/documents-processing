import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

interface NestedJSONRendererProps {
  data: unknown;
  strategy: 'inline' | 'expandable' | 'modal';
  maxDepth?: number;
}

export const NestedJSONRenderer = ({
  data,
  strategy,
  maxDepth = 3,
}: NestedJSONRendererProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (data === null || data === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  const isObject = typeof data === 'object' && !Array.isArray(data);
  const isArray = Array.isArray(data);

  if (!isObject && !isArray) {
    return <span>{String(data)}</span>;
  }

  if (strategy === 'inline') {
    const preview = isArray
      ? `[${data.length} items]`
      : `{${Object.keys(data).length} fields}`;
    return (
      <div className="text-xs">
        <span className="text-muted-foreground">{preview}</span>
      </div>
    );
  }

  if (strategy === 'expandable') {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          <span className="text-muted-foreground">
            {isArray ? `[${data.length} items]` : `{${Object.keys(data).length} fields}`}
          </span>
        </button>
        {isExpanded && (
          <div className="ml-4 pl-2 border-l border-muted">
            {isArray ? (
              <ArrayRenderer data={data} maxDepth={maxDepth} />
            ) : (
              <ObjectRenderer data={data as Record<string, unknown>} maxDepth={maxDepth} />
            )}
          </div>
        )}
      </div>
    );
  }

  // Modal strategy - for now, just show a preview
  return (
    <div className="text-xs">
      <code className="bg-muted px-2 py-1 rounded text-muted-foreground">
        {isArray ? `[${data.length} items]` : `{${Object.keys(data).length} fields}`}
      </code>
    </div>
  );
};

const ObjectRenderer = ({
  data,
  depth = 0,
  maxDepth,
}: {
  data: Record<string, unknown>;
  depth?: number;
  maxDepth: number;
}) => {
  if (depth >= maxDepth) {
    return <span className="text-muted-foreground text-xs">[max depth reached]</span>;
  }

  return (
    <div className="space-y-1 text-sm">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex gap-2">
          <span className="font-medium text-muted-foreground">{key}:</span>
          <RenderValue value={value} depth={depth + 1} maxDepth={maxDepth} />
        </div>
      ))}
    </div>
  );
};

const ArrayRenderer = ({
  data,
  depth = 0,
  maxDepth,
}: {
  data: unknown[];
  depth?: number;
  maxDepth: number;
}) => {
  if (depth >= maxDepth) {
    return <span className="text-muted-foreground text-xs">[max depth reached]</span>;
  }

  return (
    <div className="space-y-1 text-sm">
      {data.map((item, index) => (
        <div key={index} className="flex gap-2">
          <span className="text-muted-foreground">[{index}]:</span>
          <RenderValue value={item} depth={depth + 1} maxDepth={maxDepth} />
        </div>
      ))}
    </div>
  );
};

const RenderValue = ({
  value,
  depth,
  maxDepth,
}: {
  value: unknown;
  depth: number;
  maxDepth: number;
}) => {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">null</span>;
  }

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return <ArrayRenderer data={value} depth={depth} maxDepth={maxDepth} />;
    }
    return <ObjectRenderer data={value as Record<string, unknown>} depth={depth} maxDepth={maxDepth} />;
  }

  if (typeof value === 'boolean') {
    return <span className={cn(value ? 'text-green-600' : 'text-red-600')}>{String(value)}</span>;
  }

  if (typeof value === 'number') {
    return <span className="text-blue-600">{value}</span>;
  }

  return <span>{String(value)}</span>;
};
