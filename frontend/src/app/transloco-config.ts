import { TranslocoGlobalConfig } from '@jsverse/transloco-utils';

export enum AvailableLanguage {
    ES = 'es',
    EN = 'en',
}

export const AvailableLanguages = [
    AvailableLanguage.ES,
    AvailableLanguage.EN,
];

const config: TranslocoGlobalConfig = {
  langs: AvailableLanguages, //langs: ['en', 'es'],
  defaultLang: AvailableLanguage.ES,
  rootTranslationsPath: 'src/assets/i18n/',
};

export default config;