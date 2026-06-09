import { Injectable, signal } from '@angular/core';
import { Locale, SUPPORTED_LOCALES, TRANSLATIONS, TranslationKey } from './translations';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly STORAGE_KEY = 'sos_locale';

  readonly supportedLocales = SUPPORTED_LOCALES;

  readonly currentLocale = signal<Locale>(this.loadLocale());

  setLocale(code: Locale): void {
    localStorage.setItem(this.STORAGE_KEY, code);
    this.currentLocale.set(code);
  }

  translate(key: TranslationKey): string {
    const locale = this.currentLocale();
    return TRANSLATIONS[locale]?.[key] ?? TRANSLATIONS['uz'][key] ?? key;
  }

  /** Returns the localized name from an entity that has nameUz/nameRu/nameEn/nameUzKiril fields */
  entityName(entity: {
    nameUz?: string | null;
    nameRu?: string | null;
    nameEn?: string | null;
    nameUzKiril?: string | null;
    nameKk?: string | null;
  } | null | undefined): string {
    if (!entity) return '';
    const locale = this.currentLocale();
    switch (locale) {
      case 'ru':      return entity.nameRu      || entity.nameUz || '';
      case 'en':      return entity.nameEn      || entity.nameUz || '';
      case 'uz-cyrl': return entity.nameUzKiril || entity.nameUz || '';
      case 'kk':      return entity.nameKk      || entity.nameUz || '';
      default:        return entity.nameUz                       || '';
    }
  }

  private loadLocale(): Locale {
    const saved = localStorage.getItem(this.STORAGE_KEY) as Locale | null;
    return saved && SUPPORTED_LOCALES.some(l => l.code === saved) ? saved : 'uz';
  }
}
