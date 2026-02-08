import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store';
import { initializeOpenAI } from '@/services/openai/client';
import { LanguageSwitcher } from './LanguageSwitcher';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';

export const Settings = () => {
  const { t } = useTranslation(['settings', 'common']);
  const isOpen = useStore((state) => state.isSettingsOpen);
  const setOpen = useStore((state) => state.setSettingsOpen);
  const apiKey = useStore((state) => state.openaiApiKey);
  const setApiKey = useStore((state) => state.setOpenAIApiKey);
  const rateLimit = useStore((state) => state.rateLimit);
  const setRateLimit = useStore((state) => state.setRateLimit);

  const [localApiKey, setLocalApiKey] = useState(apiKey || '');
  const [localRateLimit, setLocalRateLimit] = useState(rateLimit);

  useEffect(() => {
    setLocalApiKey(apiKey || '');
  }, [apiKey]);

  const handleSave = () => {
    if (localApiKey.trim()) {
      setApiKey(localApiKey.trim());
      initializeOpenAI(localApiKey.trim());
      toast.success(t('settings:openai.apiKeySaved'));
    } else {
      setApiKey(null);
      toast.success(t('common:messages.success'));
    }

    setRateLimit(localRateLimit);
    setOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('settings:title')}</DialogTitle>
          <DialogDescription>
            {t('settings:openai.title')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">{t('settings:openai.apiKey')}</Label>
            <Input
              id="api-key"
              type="password"
              placeholder={t('settings:openai.apiKeyPlaceholder')}
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>
                {t('settings:openai.apiKeyHelp')}
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate-limit">Rate Limit (requests per minute)</Label>
            <Input
              id="rate-limit"
              type="number"
              min="1"
              max="60"
              value={localRateLimit}
              onChange={(e) => setLocalRateLimit(parseInt(e.target.value) || 10)}
            />
            <p className="text-xs text-muted-foreground">
              Limit API requests to avoid hitting OpenAI rate limits.
            </p>
          </div>

          <LanguageSwitcher />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common:buttons.cancel')}
          </Button>
          <Button onClick={handleSave}>{t('common:buttons.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
