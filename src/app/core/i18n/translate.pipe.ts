import { Pipe, PipeTransform, inject } from '@angular/core';
import { LocaleService } from './locale.service';
import { TranslationKey } from './translations';

/**
 * Translates a UI key to the current locale.
 * Usage: {{ 'nav_dashboard' | translate }}
 */
@Pipe({
  name: 'translate',
  pure: false,
  standalone: true,
})
export class TranslatePipe implements PipeTransform {
  private localeService = inject(LocaleService);

  // Force re-evaluation when locale changes by reading the signal
  transform(key: TranslationKey): string {
    this.localeService.currentLocale(); // register signal dependency
    return this.localeService.translate(key);
  }
}
