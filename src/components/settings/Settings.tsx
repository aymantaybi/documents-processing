import { useState, useEffect } from 'react';
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
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';

export const Settings = () => {
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
      toast.success('Settings saved successfully');
    } else {
      setApiKey(null);
      toast.success('API key cleared');
    }

    setRateLimit(localRateLimit);
    setOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your OpenAI API key and processing settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">OpenAI API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="sk-..."
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>
                Your API key is stored locally in your browser and sent directly to
                OpenAI. Never share this key or use it on untrusted devices.
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
