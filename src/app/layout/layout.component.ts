import { Component, signal, inject, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { VisibleForPipe } from './visible-for.pipe';
import { TranslatePipe } from '../core/i18n/translate.pipe';
import { LocaleService } from '../core/i18n/locale.service';
import { Locale, SUPPORTED_LOCALES, TranslationKey } from '../core/i18n/translations';
import { selectCurrentUser } from '../features/auth/store/auth.selectors';
import { AuthActions } from '../features/auth/store/auth.actions';

export interface NavItem {
  labelKey: TranslationKey;
  icon: string;
  route?: string;
  roles?: string[];
  children?: NavItem[];
}

const NAV_ITEMS: NavItem[] = [
  {
    labelKey: 'nav_dashboard',
    icon: 'pi pi-home',
    route: '/app/dashboard',
  },
  {
    labelKey: 'nav_org_settings',
    icon: 'pi pi-building',
    children: [
      { labelKey: 'nav_organizations', icon: 'pi pi-building', route: '/app/org-settings/organizations',    roles: ['SuperAdmin'] },
      { labelKey: 'nav_employees',     icon: 'pi pi-users',    route: '/app/org-settings/employees',        roles: ['SuperAdmin', 'StoreAdmin'] },
      { labelKey: 'nav_org_types',     icon: 'pi pi-tags',     route: '/app/org-settings/organization-types', roles: ['SuperAdmin'] },
    ],
  },
  {
    labelKey: 'nav_catalog',
    icon: 'pi pi-box',
    children: [
      { labelKey: 'nav_products', icon: 'pi pi-tag',        route: '/app/catalog/products' },
      { labelKey: 'nav_stores',   icon: 'pi pi-shop',       route: '/app/catalog/stores',  roles: ['SuperAdmin', 'StoreAdmin'] },
      { labelKey: 'nav_receipt',  icon: 'pi pi-truck',      route: '/app/catalog/receipt', roles: ['SuperAdmin', 'StoreAdmin'] },
      { labelKey: 'nav_stock',    icon: 'pi pi-warehouse',  route: '/app/catalog/stock' },
      { labelKey: 'nav_pricing',  icon: 'pi pi-percentage', route: '/app/catalog/pricing', roles: ['SuperAdmin', 'StoreAdmin'] },
    ],
  },
  {
    labelKey: 'nav_commerce',
    icon: 'pi pi-shopping-cart',
    children: [
      { labelKey: 'nav_pos',       icon: 'pi pi-receipt', route: '/app/commerce/pos',       roles: ['SuperAdmin', 'StoreAdmin', 'Cashier'] },
      { labelKey: 'nav_customers', icon: 'pi pi-user',    route: '/app/commerce/customers' },
      { labelKey: 'nav_loyalty',   icon: 'pi pi-star',    route: '/app/commerce/loyalty' },
    ],
  },
  {
    labelKey: 'nav_analytics',
    icon: 'pi pi-chart-bar',
    route: '/app/analytics',
    roles: ['SuperAdmin', 'StoreAdmin', 'Analyst'],
  },
  {
    labelKey: 'nav_settings',
    icon: 'pi pi-cog',
    roles: ['SuperAdmin'],
    children: [
      { labelKey: 'nav_users', icon: 'pi pi-users',  route: '/app/settings/users', roles: ['SuperAdmin'] },
      { labelKey: 'nav_roles', icon: 'pi pi-shield', route: '/app/settings/roles', roles: ['SuperAdmin'] },
    ],
  },
  {
    labelKey: 'nav_references',
    icon: 'pi pi-book',
    roles: ['SuperAdmin'],
    children: [
      { labelKey: 'nav_specializations',   icon: 'pi pi-id-card',   route: '/app/references/specializations',    roles: ['SuperAdmin'] },
      { labelKey: 'nav_categories',        icon: 'pi pi-sitemap',   route: '/app/references/categories',         roles: ['SuperAdmin'] },
      { labelKey: 'nav_measurement_units', icon: 'pi pi-percentage',route: '/app/references/measurement-units',  roles: ['SuperAdmin'] },
      { labelKey: 'nav_brands',            icon: 'pi pi-tag',       route: '/app/references/brands',             roles: ['SuperAdmin'] },
      { labelKey: 'nav_manufacturers',     icon: 'pi pi-building',  route: '/app/references/manufacturers',      roles: ['SuperAdmin'] },
    ],
  },
];

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, RouterLink, RouterLinkActive,
    ButtonModule, ToastModule, FormsModule,
    VisibleForPipe, TranslatePipe,
  ],
  providers: [MessageService],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  private store = inject(Store);
  localeService = inject(LocaleService);

  user$ = this.store.select(selectCurrentUser);
  collapsed       = signal(false);
  expandedGroups  = signal<Set<TranslationKey>>(new Set());
  langDropdownOpen = signal(false);

  navItems         = computed(() => NAV_ITEMS);
  supportedLocales = SUPPORTED_LOCALES;

  get currentLocale(): Locale { return this.localeService.currentLocale(); }

  get currentLocaleObj() {
    return this.supportedLocales.find(l => l.code === this.currentLocale) ?? this.supportedLocales[0];
  }

  setLocale(code: Locale): void {
    this.localeService.setLocale(code);
    this.langDropdownOpen.set(false);
  }

  toggleLangDropdown(event: Event): void {
    event.stopPropagation();
    this.langDropdownOpen.update(v => !v);
  }

  @HostListener('document:click')
  closeLangDropdown(): void {
    this.langDropdownOpen.set(false);
  }

  toggleGroup(key: TranslationKey): void {
    const s = new Set(this.expandedGroups());
    s.has(key) ? s.delete(key) : s.add(key);
    this.expandedGroups.set(s);
  }

  isExpanded(key: TranslationKey): boolean {
    return this.expandedGroups().has(key);
  }

  toggleSidebar(): void { this.collapsed.update(v => !v); }

  logout(): void { this.store.dispatch(AuthActions.logout()); }
}
