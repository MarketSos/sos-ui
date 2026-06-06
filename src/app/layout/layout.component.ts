import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { VisibleForPipe } from './visible-for.pipe';
import { selectCurrentUser } from '../features/auth/store/auth.selectors';
import { AuthActions } from '../features/auth/store/auth.actions';

export interface NavItem {
  label: string;
  icon: string;
  route?: string;
  roles?: string[];
  children?: NavItem[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    icon: 'pi pi-home',
    route: '/app/dashboard',
  },
  {
    label: 'Tashkilotlar',
    icon: 'pi pi-building',
    route: '/app/organizations',
    roles: ['SuperAdmin'],
  },
  {
    label: 'Xodimlar',
    icon: 'pi pi-users',
    route: '/app/employees',
    roles: ['SuperAdmin', 'StoreAdmin'],
  },
  {
    label: 'Katalog',
    icon: 'pi pi-box',
    children: [
      { label: 'Mahsulotlar', icon: 'pi pi-tag', route: '/app/catalog/products' },
      { label: 'Ombor', icon: 'pi pi-warehouse', route: '/app/catalog/stock' },
      { label: 'Narxlash', icon: 'pi pi-percentage', route: '/app/catalog/pricing', roles: ['SuperAdmin', 'StoreAdmin'] },
    ],
  },
  {
    label: 'Savdo',
    icon: 'pi pi-shopping-cart',
    children: [
      { label: 'Kassa (POS)', icon: 'pi pi-receipt', route: '/app/commerce/pos', roles: ['SuperAdmin', 'StoreAdmin', 'Cashier'] },
      { label: 'Mijozlar', icon: 'pi pi-user', route: '/app/commerce/customers' },
      { label: 'Loyalty', icon: 'pi pi-star', route: '/app/commerce/loyalty' },
    ],
  },
  {
    label: 'Hisobotlar',
    icon: 'pi pi-chart-bar',
    route: '/app/analytics',
    roles: ['SuperAdmin', 'StoreAdmin', 'Analyst'],
  },
  {
    label: 'Sozlamalar',
    icon: 'pi pi-cog',
    roles: ['SuperAdmin'],
    children: [
      { label: 'Foydalanuvchilar', icon: 'pi pi-users', route: '/app/settings/users', roles: ['SuperAdmin'] },
      { label: 'Rollar', icon: 'pi pi-shield', route: '/app/settings/roles', roles: ['SuperAdmin'] },
    ],
  },
];

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ButtonModule, ToastModule, VisibleForPipe],
  providers: [MessageService],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  private store = inject(Store);

  user$ = this.store.select(selectCurrentUser);
  collapsed = signal(false);
  expandedGroups = signal<Set<string>>(new Set(['Katalog', 'Savdo']));

  navItems = computed(() => NAV_ITEMS);

  toggleSidebar(): void {
    this.collapsed.update(v => !v);
  }

  toggleGroup(label: string): void {
    this.expandedGroups.update(set => {
      const next = new Set(set);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

  isExpanded(label: string): boolean {
    return this.expandedGroups().has(label);
  }

  isVisible(item: NavItem, userRole: string | undefined): boolean {
    if (!item.roles || item.roles.length === 0) return true;
    return !!userRole && item.roles.includes(userRole);
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
