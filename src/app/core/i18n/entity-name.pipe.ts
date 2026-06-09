import { Pipe, PipeTransform, inject } from '@angular/core';
import { LocaleService } from './locale.service';

type MultilingualEntity = {
  nameUz?: string | null;
  nameRu?: string | null;
  nameEn?: string | null;
  nameUzKiril?: string | null;
  nameKk?: string | null;
};

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

  transform(entity: MultilingualEntity | null | undefined): string {
    this.localeService.currentLocale(); // register signal dependency
    return this.localeService.entityName(entity);
  }
}
