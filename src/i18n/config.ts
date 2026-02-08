import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from '../../public/locales/en/common.json';
import enDocument from '../../public/locales/en/document.json';
import enPrompt from '../../public/locales/en/prompt.json';
import enSettings from '../../public/locales/en/settings.json';
import enBatch from '../../public/locales/en/batch.json';

import frCommon from '../../public/locales/fr/common.json';
import frDocument from '../../public/locales/fr/document.json';
import frPrompt from '../../public/locales/fr/prompt.json';
import frSettings from '../../public/locales/fr/settings.json';
import frBatch from '../../public/locales/fr/batch.json';

// Define resources
const resources = {
  en: {
    common: enCommon,
    document: enDocument,
    prompt: enPrompt,
    settings: enSettings,
    batch: enBatch,
  },
  fr: {
    common: frCommon,
    document: frDocument,
    prompt: frPrompt,
    settings: frSettings,
    batch: frBatch,
  },
} as const;

// Initialize i18next
i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n down to react-i18next
  .init({
    resources,
    defaultNS: 'common',
    fallbackLng: 'en',

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false, // React already escapes
    },

    // Debug in development
    debug: import.meta.env.DEV,
  });

export default i18n;
