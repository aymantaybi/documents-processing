import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useStore } from '@/store';
import { EditableCell } from './EditableCell';
import { NestedJSONRenderer } from './NestedJSONRenderer';
import { getNestedValue, setNestedValue } from '@/utils/json';
import { ColumnConfig } from '@/types';
import { updateResultEditedData } from '@/services/storage/results';
import toast from 'react-hot-toast';

interface DataTableProps {
  promptId: string | null;
}

export const DataTable = ({ promptId }: DataTableProps) => {
  const prompts = useStore((state) => state.prompts);
  const documents = useStore((state) => state.documents);
  const results = useStore((state) => state.results);
  const updateResult = useStore((state) => state.updateResult);
  const currentIndex = useStore((state) => state.currentIndex);
  const setCurrentIndex = useStore((state) => state.setCurrentIndex);

  const activePrompt = prompts.find((p) => p.id === promptId);

  // Get completed documents with results
  const tableData = useMemo(() => {
    const completedDocs = documents.filter((doc) => doc.status === 'completed');
    return completedDocs
      .map((doc) => {
        const result = results[doc.id];
        if (!result) return null;

        const dataToDisplay = result.editedData || result.data;
        return {
          _documentId: doc.id,
          _documentName: doc.name,
          _hasErrors: (result.validationErrors?.length ?? 0) > 0,
          ...dataToDisplay,
        };
      })
      .filter(Boolean) as Record<string, unknown>[];
  }, [documents, results]);

  // Generate columns from UI config
  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => {
    if (!activePrompt) return [];

    const cols: ColumnDef<Record<string, unknown>>[] = [
      {
        accessorKey: '_documentName',
        header: 'Document',
        cell: ({ row }) => {
          const hasErrors = row.original._hasErrors as boolean;
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium">{row.original._documentName as string}</span>
              {hasErrors && (
                <span title="Validation errors">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </span>
              )}
            </div>
          );
        },
        size: 200,
      },
    ];

    activePrompt.uiConfig.columns.forEach((colConfig: ColumnConfig) => {
      cols.push({
        accessorKey: colConfig.key,
        header: colConfig.label,
        size: colConfig.width,
        cell: ({ row }) => {
          const value = getNestedValue(row.original, colConfig.key);
          const documentId = row.original._documentId as string;

          const handleSave = async (newValue: unknown) => {
            try {
              const result = results[documentId];
              if (!result) return;

              // Get the current data (edited or original)
              const currentData = result.editedData || result.data;

              // Create a deep copy and update the value
              const updatedData = JSON.parse(JSON.stringify(currentData));
              setNestedValue(updatedData, colConfig.key, newValue);

              // Save to IndexedDB
              await updateResultEditedData(documentId, updatedData);

              // Update store
              updateResult(documentId, updatedData);

              toast.success('Value updated');
            } catch (error) {
              console.error('Failed to update value:', error);
              toast.error('Failed to update value');
            }
          };

          if (colConfig.type === 'nested') {
            return (
              <NestedJSONRenderer
                data={value}
                strategy={activePrompt.uiConfig.nestedRenderStrategy}
              />
            );
          }

          return (
            <EditableCell
              value={value}
              type={colConfig.type}
              editable={colConfig.editable}
              onSave={handleSave}
              format={colConfig.format}
            />
          );
        },
      });
    });

    return cols;
  }, [activePrompt, results, updateResult]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!activePrompt) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No active prompt selected. Please select a prompt to view results.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tableData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Extracted Data</CardTitle>
          <CardDescription>Results from processed documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No processed documents yet. Process some documents to see results here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extracted Data</CardTitle>
        <CardDescription>
          {tableData.length} document{tableData.length !== 1 ? 's' : ''} processed
          {' · '}
          Double-click cells to edit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} style={{ width: header.getSize() }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={index === currentIndex ? 'selected' : undefined}
                  onClick={() => setCurrentIndex(index)}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
