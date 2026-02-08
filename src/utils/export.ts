import * as XLSX from 'xlsx';
import { Document, ExtractedData } from '@/types';

/**
 * Flattens nested objects into dot notation keys
 * Example: { user: { name: 'John' } } => { 'user.name': 'John' }
 */
const flattenObject = (
  obj: Record<string, unknown>,
  prefix = ''
): Record<string, unknown> => {
  const flattened: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(flattened, flattenObject(value as Record<string, unknown>, newKey));
    } else if (Array.isArray(value)) {
      // Convert arrays to JSON string for simplicity
      flattened[newKey] = JSON.stringify(value);
    } else if (value instanceof Date) {
      flattened[newKey] = value.toISOString();
    } else {
      flattened[newKey] = value;
    }
  }

  return flattened;
};

export interface ExportOptions {
  includeDocumentInfo?: boolean; // Include document name, upload date, etc.
  useEditedData?: boolean; // Use editedData if available, otherwise use original data
}

/**
 * Exports extracted data to Excel format
 */
export const exportToExcel = (
  documents: Document[],
  results: Record<string, ExtractedData>,
  options: ExportOptions = {}
): void => {
  const { includeDocumentInfo = true, useEditedData = true } = options;

  // Filter only completed documents with results
  const completedDocs = documents.filter(
    (doc) => doc.status === 'completed' && results[doc.id]
  );

  if (completedDocs.length === 0) {
    throw new Error('No completed documents to export');
  }

  // Prepare data rows
  const rows = completedDocs.map((doc) => {
    const result = results[doc.id];
    const dataToUse = useEditedData && result.editedData ? result.editedData : result.data;

    // Flatten the data
    const flatData = flattenObject(dataToUse);

    // Add document info if requested
    if (includeDocumentInfo) {
      return {
        'Document Name': doc.name,
        'Upload Date': doc.uploadedAt.toISOString(),
        'Processed Date': doc.processedAt?.toISOString() || '',
        ...flatData,
      };
    }

    return flatData;
  });

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Extracted Data');

  // Auto-size columns
  const maxWidth = 50;
  const colWidths = Object.keys(rows[0] || {}).map((key) => {
    const maxLength = Math.max(
      key.length,
      ...rows.map((row) => String(row[key] || '').length)
    );
    return { wch: Math.min(maxLength + 2, maxWidth) };
  });
  worksheet['!cols'] = colWidths;

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `extracted-data-${timestamp}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, filename);
};

/**
 * Exports data with separate sheets for nested objects
 */
export const exportToExcelMultiSheet = (
  documents: Document[],
  results: Record<string, ExtractedData>,
  options: ExportOptions = {}
): void => {
  const { includeDocumentInfo = true, useEditedData = true } = options;

  const completedDocs = documents.filter(
    (doc) => doc.status === 'completed' && results[doc.id]
  );

  if (completedDocs.length === 0) {
    throw new Error('No completed documents to export');
  }

  const workbook = XLSX.utils.book_new();

  // Main sheet with flattened data
  const mainRows = completedDocs.map((doc) => {
    const result = results[doc.id];
    const dataToUse = useEditedData && result.editedData ? result.editedData : result.data;
    const flatData = flattenObject(dataToUse);

    if (includeDocumentInfo) {
      return {
        'Document Name': doc.name,
        'Upload Date': doc.uploadedAt.toISOString(),
        'Processed Date': doc.processedAt?.toISOString() || '',
        ...flatData,
      };
    }

    return flatData;
  });

  const mainSheet = XLSX.utils.json_to_sheet(mainRows);
  XLSX.utils.book_append_sheet(workbook, mainSheet, 'All Data');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `extracted-data-${timestamp}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, filename);
};
