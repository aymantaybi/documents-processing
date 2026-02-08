import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { Prompt } from '@/types';
import { useStore } from '@/store';
import { deletePrompt } from '@/services/storage/prompts';
import { formatDateTime } from '@/utils/format';
import toast from 'react-hot-toast';

interface PromptListProps {
  prompts: Prompt[];
  onCreateNew: () => void;
  onEdit: (promptId: string) => void;
}

export const PromptList = ({ prompts, onCreateNew, onEdit }: PromptListProps) => {
  const activePromptId = useStore((state) => state.activePromptId);
  const setActivePrompt = useStore((state) => state.setActivePrompt);
  const removePrompt = useStore((state) => state.removePrompt);

  const handleDelete = async (promptId: string) => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      await deletePrompt(promptId);
      removePrompt(promptId);
      toast.success('Prompt deleted');
    }
  };

  const handleSetActive = (promptId: string) => {
    setActivePrompt(promptId);
    toast.success('Active prompt updated');
  };

  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground mb-4">No prompts created yet</p>
        <Button onClick={onCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create Your First Prompt
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {prompts.length} prompt{prompts.length !== 1 ? 's' : ''}
        </p>
        <Button size="sm" onClick={onCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create New
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
                      {Object.keys(prompt.jsonSchema.properties).length} fields
                    </span>
                    <span>•</span>
                    <span>{prompt.uiConfig.columns.length} columns</span>
                    <span>•</span>
                    <span>Updated {formatDateTime(prompt.updatedAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {activePromptId !== prompt.id && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSetActive(prompt.id)}
                    >
                      Set Active
                    </Button>
                  )}
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
