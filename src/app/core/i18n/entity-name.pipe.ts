import { Pipe, PipeTransform, inject } from '@angular/core';
import { LocalizableNamePartial } from '../models/localizable-name.model';
import { LocaleService } from './locale.service';

/**
 * Returns the name field of a multilingual entity based on the current locale.
 * Usage: {{ item | entityName }}
 */
@Pipe({
  name: 'entityName',
  pure: false,
  standalone: true,
})
export class EntityNamePipe implements PipeTransform {
  private localeService = inject(LocaleService);

  transform(entity: LocalizableNamePartial | null | undefined): string {
    this.localeService.currentLocale(); // register signal dependency
    return this.localeService.entityName(entity);
  }
}
