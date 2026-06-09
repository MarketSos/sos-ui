import { Pipe, PipeTransform } from '@angular/core';
import { NavItem } from './layout.component';

@Pipe({ name: 'visibleFor', standalone: true })
export class VisibleForPipe implements PipeTransform {
  transform(item: NavItem, role: string | undefined): boolean {
    if (!item.roles || item.roles.length === 0) return true;
    return !!role && item.roles.includes(role);
  }
}
