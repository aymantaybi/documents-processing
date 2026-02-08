import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, CheckCircle, Copy } from 'lucide-react';
import { Prompt } from '@/types';
import { useStore } from '@/store';
import { deletePrompt, savePrompt } from '@/services/storage/prompts';
import { formatDateTime } from '@/utils/format';
import toast from 'react-hot-toast';

interface PromptListProps {
  prompts: Prompt[];
  onCreateNew: () => void;
  onEdit: (promptId: string) => void;
}

export const PromptList = ({ prompts, onCreateNew, onEdit }: PromptListProps) => {
  const { t } = useTranslation('prompt');
  const activePromptId = useStore((state) => state.activePromptId);
  const setActivePrompt = useStore((state) => state.setActivePrompt);
  const removePrompt = useStore((state) => state.removePrompt);
  const addPrompt = useStore((state) => state.addPrompt);

  const handleDelete = async (promptId: string) => {
    if (confirm(t('list.deleteConfirm'))) {
      await deletePrompt(promptId);
      removePrompt(promptId);
      toast.success(t('list.deleted'));
    }
  };

  const handleSetActive = (promptId: string) => {
    setActivePrompt(promptId);
    toast.success(t('list.activeUpdated'));
  };

  const handleDuplicate = async (prompt: Prompt) => {
    const now = new Date();
    const duplicatedPrompt: Prompt = {
      ...prompt,
      id: `${Date.now()}-${Math.random()}`,
      name: `${prompt.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
    };

    await savePrompt(duplicatedPrompt);
    addPrompt(duplicatedPrompt);
    toast.success(t('list.duplicated'));
  };

  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground mb-4">{t('list.empty')}</p>
        <Button onClick={onCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          {t('list.createFirst')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {t(`list.prompt_${prompts.length === 1 ? 'one' : 'other'}`, { count: prompts.length })}
        </p>
        <Button size="sm" onClick={onCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          {t('list.createNew')}
        </Button>
      </div>

      <div className="space-y-2">
        {prompts.map((prompt) => (
          <Card
            key={prompt.id}
            className={
              activePromptId === prompt.id
                ? 'border-primary bg-primary/5'
                : ''
            }
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{prompt.name}</h4>
                    {activePromptId === prompt.id && (
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </div>
                  {prompt.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {prompt.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      {Object.keys(prompt.jsonSchema.properties).length} {t('list.fields')}
                    </span>
                    <span>•</span>
                    <span>{prompt.uiConfig.columns.length} {t('list.columns')}</span>
                    <span>•</span>
                    <span>{t('list.updated', { date: formatDateTime(prompt.updatedAt) })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {activePromptId !== prompt.id && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSetActive(prompt.id)}
                    >
                      {t('list.setActive')}
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDuplicate(prompt)}
                    title="Duplicate prompt"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEdit(prompt.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(prompt.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
