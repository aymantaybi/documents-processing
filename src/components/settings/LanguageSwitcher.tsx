import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStore } from '@/store';
import { Language } from '@/types';

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation('settings');
  const language = useStore((state) => state.language);
  const setLanguage = useStore((state) => state.setLanguage);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <div className="space-y-2">
      <Label>{t('language.label')}</Label>
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{t('language.english')}</SelectItem>
          <SelectItem value="fr">{t('language.french')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
