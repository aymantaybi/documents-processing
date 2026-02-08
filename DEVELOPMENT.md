# Document Processing App - Development Guide

## Project Status

### ✅ Completed (Phase 1-3)

The foundation and core services of the application are fully implemented:

#### 1. **Project Setup**
- ✅ Vite + React + TypeScript configured
- ✅ Tailwind CSS + shadcn/ui components
- ✅ ESLint and development tools
- ✅ Path aliases (`@/` → `src/`)

#### 2. **Type System**
- ✅ Complete TypeScript definitions
  - [src/types/document.ts](src/types/document.ts) - Document types
  - [src/types/prompt.ts](src/types/prompt.ts) - Prompt and schema types
  - [src/types/processing.ts](src/types/processing.ts) - Processing job types
  - [src/types/schema.ts](src/types/schema.ts) - Validation types

#### 3. **State Management (Zustand)**
- ✅ Modular store with slices
  - [src/store/documentSlice.ts](src/store/documentSlice.ts) - Document CRUD
  - [src/store/promptSlice.ts](src/store/promptSlice.ts) - Prompt management
  - [src/store/processingSlice.ts](src/store/processingSlice.ts) - Batch processing state
  - [src/store/uiSlice.ts](src/store/uiSlice.ts) - UI state (navigation, modals)
  - [src/store/settingsSlice.ts](src/store/settingsSlice.ts) - Settings (API key, rate limit)
- ✅ LocalStorage persistence for settings

#### 4. **Storage Services (IndexedDB)**
- ✅ Database schema with 3 stores: documents, prompts, results
- ✅ CRUD operations:
  - [src/services/storage/db.ts](src/services/storage/db.ts) - DB initialization
  - [src/services/storage/documents.ts](src/services/storage/documents.ts) - Document operations
  - [src/services/storage/prompts.ts](src/services/storage/prompts.ts) - Prompt operations
  - [src/services/storage/results.ts](src/services/storage/results.ts) - Result operations

#### 5. **OpenAI Integration**
- ✅ Client initialization with browser support
  - [src/services/openai/client.ts](src/services/openai/client.ts)
- ✅ Document processor with vision API (gpt-4o)
  - [src/services/openai/processor.ts](src/services/openai/processor.ts)
- ✅ Rate limiter for API calls
  - [src/services/openai/rateLimit.ts](src/services/openai/rateLimit.ts)
- ✅ Batch processing support

#### 6. **PDF & Image Processing**
- ✅ PDF to image conversion using pdf.js
  - [src/services/pdf/converter.ts](src/services/pdf/converter.ts)
- ✅ Image file loader
  - [src/services/pdf/loader.ts](src/services/pdf/loader.ts)
- ✅ File validation and type detection

#### 7. **Validation Services**
- ✅ JSON schema validation with Ajv
  - [src/services/validation/validator.ts](src/services/validation/validator.ts)
- ✅ Schema utilities and helpers
  - [src/services/validation/schema.ts](src/services/validation/schema.ts)

#### 8. **UI Components (Completed)**
- ✅ Layout:
  - [src/components/layout/Header.tsx](src/components/layout/Header.tsx) - App header with nav
  - [src/components/layout/MainLayout.tsx](src/components/layout/MainLayout.tsx) - Page layout wrapper
- ✅ Settings:
  - [src/components/settings/Settings.tsx](src/components/settings/Settings.tsx) - API key configuration
- ✅ Document Import:
  - [src/components/document-import/DocumentImport.tsx](src/components/document-import/DocumentImport.tsx) - Drag & drop file import
- ✅ UI Primitives (shadcn/ui):
  - Button, Input, Card, Dialog, Label

#### 9. **Utilities**
- ✅ [src/utils/cn.ts](src/utils/cn.ts) - Tailwind class merger
- ✅ [src/utils/json.ts](src/utils/json.ts) - JSON path utilities
- ✅ [src/utils/format.ts](src/utils/format.ts) - Date/file size formatters
- ✅ [src/utils/error.ts](src/utils/error.ts) - Error classes and handlers

---

## 🚧 To Be Implemented (Phase 4-10)

### Phase 4: Prompt Manager
**Components to create:**
- `src/components/prompt-manager/PromptManager.tsx` - Main prompt management UI
- `src/components/prompt-manager/PromptList.tsx` - List of saved prompts
- `src/components/prompt-manager/PromptEditor.tsx` - Create/edit prompt form
- `src/components/prompt-manager/SchemaEditor.tsx` - Monaco editor for JSON schema
- `src/components/prompt-manager/UIConfigEditor.tsx` - Column configuration form

**Features:**
- Create, edit, delete prompts
- JSON schema editor with validation
- UI config for table columns (map JSON paths to columns)
- Prompt selection for processing

**Key Implementation Details:**
```typescript
// PromptManager should allow:
- Creating new prompt with name, system prompt, JSON schema, UI config
- Editing existing prompts
- Deleting prompts
- Setting active prompt for batch processing
```

---

### Phase 5: Data Table with Inline Editing
**Components to create:**
- `src/components/data-table/DataTable.tsx` - Main table using @tanstack/react-table
- `src/components/data-table/EditableCell.tsx` - Inline editable cell
- `src/components/data-table/NestedJSONRenderer.tsx` - Render nested objects
- `src/components/data-table/ColumnGenerator.tsx` - Generate columns from UI config

**Features:**
- Dynamic column generation from prompt's UI config
- Inline editing (double-click to edit)
- Nested JSON rendering (expandable or modal)
- Row highlighting synced with document viewer
- Save edits to IndexedDB

**Key Implementation:**
```typescript
// DataTable receives:
- results: ExtractedData[]
- uiConfig: UIConfig from active prompt
- onRowClick: (index) => void // Sync with viewer

// EditableCell:
- Double-click to edit
- Validate against schema
- Save to IndexedDB on blur/enter
```

---

### Phase 6: Document Viewer
**Components to create:**
- `src/components/document-viewer/DocumentViewer.tsx` - Main viewer component
- `src/components/document-viewer/PDFRenderer.tsx` - PDF rendering with react-pdf
- `src/components/document-viewer/DocumentNavigator.tsx` - Prev/Next controls

**Features:**
- Render PDFs using react-pdf
- Display images
- Navigation controls (prev/next, page numbers)
- Zoom controls
- Synced with table's currentIndex

**Key Implementation:**
```typescript
// DocumentViewer:
- Get current document from store.currentIndex
- Render PDF pages or images
- Update store.currentIndex on navigation
- Highlight current page/document
```

---

### Phase 7: Split View Layout
**Components to create:**
- `src/components/layout/SplitView.tsx` - Resizable split pane

**Features:**
- Left panel: DataTable
- Right panel: DocumentViewer
- Resizable divider
- Synchronized navigation

**Key Implementation:**
```typescript
// SplitView manages:
- Left/right panel rendering
- Resizing with drag handle
- Both panels read store.currentIndex
- Click in table → updates currentIndex → viewer updates
- Navigate in viewer → updates currentIndex → table highlights row
```

---

### Phase 8: Batch Processor
**Components to create:**
- `src/components/batch-processor/BatchProcessor.tsx` - Main processing UI
- `src/components/batch-processor/ProcessingProgress.tsx` - Progress bar and status

**Features:**
- Start/pause/cancel processing
- Progress bar with counts (completed/failed/total)
- Current document indicator
- Error handling and retry
- Process all pending documents with selected prompt

**Key Implementation:**
```typescript
// BatchProcessor workflow:
1. User selects active prompt
2. Click "Process" button
3. For each document:
   - Convert PDF to images (or load image)
   - Call OpenAI with prompt and images
   - Validate response
   - Save to results
   - Update progress
4. Display results in table
```

---

### Phase 9: Additional UI Components
**Still needed:**
- `src/components/ui/tabs.tsx` - For PromptManager
- `src/components/ui/select.tsx` - For prompt selection
- `src/components/ui/progress.tsx` - For BatchProcessor
- `src/components/ui/badge.tsx` - For status indicators

---

### Phase 10: Polish & Testing
- Error boundaries
- Loading states and skeletons
- Empty states (no documents, no prompts, no results)
- Keyboard shortcuts (arrow keys for navigation)
- Responsive design (mobile-friendly)
- End-to-end testing

---

## 🎯 Current App Features

The app currently supports:

1. ✅ **Settings Management**
   - Configure OpenAI API key
   - Set rate limits
   - Persistent settings storage

2. ✅ **Document Import**
   - Drag & drop or click to upload
   - Support for PDF, JPG, PNG, WebP
   - Document list with file info
   - Remove documents

3. ✅ **Core Services Ready**
   - PDF to image conversion
   - OpenAI API integration
   - IndexedDB storage
   - Validation services

---

## 🚀 Getting Started

### Development
```bash
npm install
npm run dev
```

Visit http://localhost:5173

### Build
```bash
npm run build
npm run preview
```

---

## 📝 Implementation Priority

To get a working end-to-end prototype:

1. **Prompt Manager** (Phase 4) - Essential for defining how to process documents
2. **Batch Processor** (Phase 8) - Process documents with OpenAI
3. **Data Table** (Phase 5) - Display results
4. **Document Viewer** (Phase 6) - View source documents
5. **Split View** (Phase 7) - Combine table and viewer
6. **Polish** (Phase 9-10) - Improve UX

---

## 🏗️ Architecture Highlights

### Data Flow
```
Import → Store → IndexedDB
                ↓
           Process with OpenAI
                ↓
           Validate against schema
                ↓
        Save to results
                ↓
        Display in table
```

### State Management
- **Zustand** for reactive state
- **IndexedDB** as source of truth
- **LocalStorage** for settings only

### Component Hierarchy
```
App
├── MainLayout
│   ├── Header
│   └── Main Content
│       ├── DocumentImport
│       ├── PromptManager (TODO)
│       ├── SplitView (TODO)
│       │   ├── DataTable (TODO)
│       │   └── DocumentViewer (TODO)
│       └── BatchProcessor (TODO)
├── Settings (Modal)
└── Toast Notifications
```

---

## 🧪 Testing Locally

Once the remaining components are implemented:

1. Open Settings → Add OpenAI API key
2. Create a prompt:
   - System: "Extract invoice data"
   - Schema: `{ "type": "object", "properties": { "invoice_number": { "type": "string" } } }`
   - UI Config: Map fields to table columns
3. Import PDF invoices
4. Click "Process"
5. View results in table
6. Edit extracted data inline
7. Navigate through documents

---

## 📚 Key Dependencies

- **React 18** + **TypeScript** - UI framework
- **Vite** - Build tool
- **Zustand** - State management
- **openai** - OpenAI API client
- **pdfjs-dist** + **react-pdf** - PDF rendering
- **idb** - IndexedDB wrapper
- **@tanstack/react-table** - Table component
- **ajv** - JSON schema validation
- **react-dropzone** - File upload
- **tailwindcss** - Styling
- **@radix-ui/* - UI primitives

---

## 🔒 Security Notes

- API key stored in browser LocalStorage
- All API calls go directly to OpenAI (no backend proxy)
- ⚠️ **Warning:** Not suitable for production use with sensitive data
- For production: implement backend proxy for API key management

---

## 📖 Next Steps

Continue implementation following the phases above. Each component has detailed specifications in the original plan file: [/Users/aymantaybi/.claude/plans/composed-painting-babbage.md](/Users/aymantaybi/.claude/plans/composed-painting-babbage.md)

Key files to implement next:
1. `src/components/prompt-manager/PromptManager.tsx`
2. `src/components/batch-processor/BatchProcessor.tsx`
3. `src/components/data-table/DataTable.tsx`
4. `src/components/document-viewer/DocumentViewer.tsx`
5. `src/components/layout/SplitView.tsx`
