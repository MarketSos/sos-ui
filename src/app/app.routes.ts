import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // Auth (sidebar yo'q)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },

  // Protected (sidebar bilan)
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },

      // Tashkilot sozlamalari
      {
        path: 'org-settings',
        children: [
          { path: '', redirectTo: 'organizations', pathMatch: 'full' },
          {
            path: 'organizations',
            loadComponent: () => import('./features/organizations/organizations.component').then(m => m.OrganizationsComponent),
          },
          {
            path: 'employees',
            loadComponent: () => import('./features/employees/employees.component').then(m => m.EmployeesComponent),
          },
          {
            path: 'organization-types',
            loadComponent: () => import('./features/references/organization-types/organization-types.component').then(m => m.OrganizationTypesComponent),
          },
        ],
      },

      // Katalog
      {
        path: 'catalog',
        children: [
          { path: '', redirectTo: 'products', pathMatch: 'full' },
          {
            path: 'products',
            loadComponent: () => import('./features/catalog/products/products.component').then(m => m.ProductsComponent),
          },
          {
            path: 'stock',
            loadComponent: () => import('./features/catalog/stock/stock.component').then(m => m.StockComponent),
          },
          {
            path: 'stores',
            loadComponent: () => import('./features/catalog/stores/stores.component').then(m => m.StoresComponent),
          },
          {
            path: 'pricing',
            loadComponent: () => import('./features/catalog/pricing/pricing.component').then(m => m.PricingComponent),
          },
          {
            path: 'receipt',
            loadComponent: () => import('./features/catalog/receipt/receipt.component').then(m => m.StockReceiptComponent),
          },
        ],
      },

      // Savdo
      {
        path: 'commerce',
        children: [
          { path: '', redirectTo: 'pos', pathMatch: 'full' },
          {
            path: 'pos',
            loadComponent: () => import('./features/commerce/pos/pos.component').then(m => m.PosComponent),
          },
          {
            path: 'customers',
            loadComponent: () => import('./features/commerce/customers/customers.component').then(m => m.CustomersComponent),
          },
          {
            path: 'loyalty',
            loadComponent: () => import('./features/commerce/loyalty/loyalty.component').then(m => m.LoyaltyComponent),
          },
        ],
      },

      // Hisobotlar
      {
        path: 'analytics',
        loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent),
      },

      // Sozlamalar
      {
        path: 'settings',
        children: [
          { path: '', redirectTo: 'users', pathMatch: 'full' },
          {
            path: 'users',
            loadComponent: () => import('./features/settings/users/users.component').then(m => m.UsersComponent),
          },
          {
            path: 'roles',
            loadComponent: () => import('./features/settings/roles/roles.component').then(m => m.RolesComponent),
          },
        ],
      },

      // Ma'lumotnoma
      {
        path: 'references',
        children: [
          { path: '', redirectTo: 'specializations', pathMatch: 'full' },
          {
            path: 'specializations',
            loadComponent: () => import('./features/references/specializations/specializations.component').then(m => m.SpecializationsComponent),
          },
          {
            path: 'categories',
            loadComponent: () => import('./features/references/categories/categories.component').then(m => m.CategoriesComponent),
          },
          {
            path: 'measurement-units',
            loadComponent: () => import('./features/references/measurement-units/measurement-units.component').then(m => m.MeasurementUnitsComponent),
          },
          {
            path: 'brands',
            loadComponent: () => import('./features/references/brands/brands.component').then(m => m.BrandsComponent),
          },
          {
            path: 'manufacturers',
            loadComponent: () => import('./features/references/manufacturers/manufacturers.component').then(m => m.ManufacturersComponent),
          },
        ],
      },
    ],
  },

  { path: '**', redirectTo: 'auth/login' },
];
