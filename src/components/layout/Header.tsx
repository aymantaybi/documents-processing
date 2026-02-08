import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Settings, FileText } from 'lucide-react';
import { useStore } from '@/store';

export const Header = () => {
  const { t } = useTranslation('common');
  const setSettingsOpen = useStore((state) => state.setSettingsOpen);
  const setPromptManagerOpen = useStore((state) => state.setPromptManagerOpen);

  return (
    <header className="border-b bg-card">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <h1 className="text-xl font-bold">{t('header.title')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPromptManagerOpen(true)}
          >
            <FileText className="mr-2 h-4 w-4" />
            {t('header.prompts')}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
