import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStore } from '@/store';
import { getPrompts } from '@/services/storage/prompts';
import { PromptList } from './PromptList';
import { PromptEditor } from './PromptEditor';

export const PromptManager = () => {
  const { t } = useTranslation('prompt');
  const isOpen = useStore((state) => state.isPromptManagerOpen);
  const setOpen = useStore((state) => state.setPromptManagerOpen);
  const prompts = useStore((state) => state.prompts);
  const setPrompts = useStore((state) => state.setPrompts);
  const [activeTab, setActiveTab] = useState('list');
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Load prompts from IndexedDB when dialog opens
      getPrompts().then(setPrompts);
    }
  }, [isOpen, setPrompts]);

  const handleCreateNew = () => {
    setEditingPromptId(null);
    setActiveTab('editor');
  };

  const handleEdit = (promptId: string) => {
    setEditingPromptId(promptId);
    setActiveTab('editor');
  };

  const handleSaved = () => {
    setActiveTab('list');
    setEditingPromptId(null);
    // Reload prompts
    getPrompts().then(setPrompts);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('manager.title')}</DialogTitle>
          <DialogDescription>
            {t('manager.description')}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">{t('manager.tabs.list')}</TabsTrigger>
            <TabsTrigger value="editor">
              {editingPromptId ? t('manager.tabs.editPrompt') : t('manager.tabs.editor')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="flex-1 overflow-auto">
            <PromptList
              prompts={prompts}
              onCreateNew={handleCreateNew}
              onEdit={handleEdit}
            />
          </TabsContent>

          <TabsContent value="editor" className="flex-1 overflow-auto">
            <PromptEditor
              promptId={editingPromptId}
              onSaved={handleSaved}
              onCancel={() => setActiveTab('list')}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
