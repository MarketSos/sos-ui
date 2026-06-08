# SOS UI — Store OS Frontend

Angular 19 + NgRx + PrimeNG bilan yozilgan savdo tizimi (POS) uchun admin panel.

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | Angular 19 (standalone components, signals) |
| State | NgRx 19 (Store + Effects) |
| UI | PrimeNG 19 + Aura theme |
| HTTP | Angular HttpClient + functional interceptors |
| Routing | Angular Router (lazy loading) |
| Styling | SCSS (component-scoped) |

```
npm start        # ng serve → localhost:4200
npm run build    # production build
```

---

## Folder Structure

```
src/app/
├── core/
│   ├── guards/          auth.guard.ts
│   ├── interceptors/    auth.interceptor.ts
│   ├── models/          api-response.model.ts
│   └── services/
│       ├── api.service.ts        ← barcha HTTP so'rovlar shu orqali
│       ├── auth-token.service.ts ← localStorage: token, user
│       └── core-api.service.ts   ← core servisi uchun barcha DTOlar + metodlar
├── features/
│   ├── auth/            login, register, store/ (NgRx)
│   ├── analytics/
│   ├── catalog/         products/, stock/, pricing/, receipt/
│   ├── commerce/        pos/, customers/, loyalty/
│   ├── dashboard/
│   ├── employees/
│   ├── organizations/
│   ├── references/      brands/, categories/, manufacturers/,
│   │                    measurement-units/, organization-types/, specializations/
│   └── settings/        users/, roles/
├── layout/
│   ├── layout.component.*   ← sidebar + topbar shell
│   └── visible-for.pipe.ts  ← role-based nav item filter
├── app.routes.ts
└── app.config.ts
```

---

## Route Structure

```
/                        → redirect /auth/login
/auth/login              (no sidebar)
/auth/register           (no sidebar)

/app                     [authGuard] → LayoutComponent
  /app/dashboard
  /app/org-settings/organizations
  /app/org-settings/employees
  /app/org-settings/organization-types
  /app/catalog/products
  /app/catalog/stock
  /app/catalog/pricing
  /app/catalog/receipt
  /app/commerce/pos
  /app/commerce/customers
  /app/commerce/loyalty
  /app/analytics
  /app/settings/users
  /app/settings/roles
  /app/references/specializations
  /app/references/categories
  /app/references/measurement-units
  /app/references/brands
  /app/references/manufacturers
```

Barcha protected routelar `authGuard` orqali, `LayoutComponent` ichida lazy load qilinadi.

---

## API Services Pattern

### ApiService (core/services/api.service.ts)
Barcha HTTP so'rovlarning asosi. Service nomini `ServiceName` sifatida qabul qiladi:

```typescript
type ServiceName = keyof typeof environment.apiUrls;
// 'core' | 'catalog' | 'commerce' | 'analytics'
```

```typescript
this.api.get<T>('catalog', 'brands')
this.api.post<T>('core', 'users', body)
this.api.put<T>('catalog', `brands/${id}`, body)
this.api.patch<T>('core', `users/${id}/activate`, {})
this.api.delete<T>('catalog', `brands/${id}`)
```

URL pattern: `environment.apiUrls[service]/path`
→ `http://localhost:5000/api/catalog/brands`

### Environment API URLs (environment.ts)
```typescript
apiUrls: {
  core:      'http://localhost:5000/api/core',
  catalog:   'http://localhost:5000/api/catalog',
  commerce:  'http://localhost:5000/api/commerce',
  analytics: 'http://localhost:5000/api/analytics',
}
```

### CoreApiService (core/services/core-api.service.ts)
Core va catalog servislarining birlashgan wrapper'i. DTOlar ham shu faylda:
- `UserDto`, `RoleSummaryDto`, `RoleDto`
- `OrgTypeDto`, `SpecializationDto`
- `CategoryDto`, `MeasurementUnitDto`
- `BrandDto`, `ManufacturerDto`
- `EmployeeSummaryDto`, `EmployeeDto`

Feature-specific servislar (masalan `ProductsService`, `OrganizationsService`) o'zining model faylida DTOlarni saqlaydi va `ApiService` ni to'g'ridan-to'g'ri ishlatadi.

---

## Feature Service Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class OrganizationsService {
  constructor(private api: ApiService) {}

  getAll(): Observable<OrganizationSummary[]> {
    return this.api.get<OrganizationSummary[]>('core', 'organizations');
  }
  create(req: CreateOrganizationRequest): Observable<{ organizationId: string }> {
    return this.api.post<{ organizationId: string }>('core', 'organizations', req);
  }
}
```

Model fayli: `feature.models.ts` (interfaces, types, request/response shapes)
Service fayli: `feature.service.ts` (API calls, faqat `ApiService` dependency)

---

## Component Pattern

Barcha komponentlar **standalone** + **signals** ishlatadi:

```typescript
@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,
            TableModule, ButtonModule, ToastModule, DialogModule, InputTextModule],
  providers: [MessageService],
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.scss'],
})
export class BrandsComponent implements OnInit {
  private svc   = inject(CoreApiService);
  private fb    = inject(FormBuilder);
  private toast = inject(MessageService);

  loading = signal(true);
  saving  = signal(false);
  items   = signal<BrandDto[]>([]);
  dialogVisible = signal(false);
  editMode      = signal(false);
  selected      = signal<BrandDto | null>(null);

  form = this.fb.group({ nameUz: ['', Validators.required], ... });

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.svc.getBrands().pipe(catchError(() => of([]))).subscribe(data => {
      this.items.set(data);
      this.loading.set(false);
    });
  }
  // openCreate(), openEdit(), save(), delete()
}
```

**Qoidalar:**
- `inject()` ishlatiladi (constructor injection emas, feature servislar bundan mustasno)
- `signal()` — lokal state uchun (`loading`, `saving`, `dialogVisible`, ma'lumotlar)
- `catchError(() => of([]))` — har doim xatoni ushlab qolish
- `providers: [MessageService]` — toast uchun har bir komponentda
- Constructor injection faqat `AuthEffects` va feature servicelarida

---

## CRUD Component Standart Shabl

Reference komponentlari (brands, categories, manufacturers va h.k.) bir xil pattern:

```
state:    loading, saving, items, dialogVisible, editMode, selected
methods:  load(), openCreate(), openEdit(item), save(), delete(item)
template: p-toast → .page > .page-header + p-table → p-dialog > form
```

---

## NgRx Pattern (faqat auth da)

```
features/auth/store/
├── auth.actions.ts    ← createActionGroup({ source: 'Auth', events: {...} })
├── auth.effects.ts    ← Injectable class, createEffect() + ofType()
├── auth.reducer.ts    ← createReducer() + on()
├── auth.selectors.ts  ← createFeatureSelector + createSelector
└── auth.model.ts      ← User, LoginRequest, LoginResponse, AuthState
```

```typescript
// Actions — createActionGroup ishlatiladi
export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login': props<{ credentials: LoginRequest }>(),
    'Login Success': props<{ response: LoginResponse }>(),
    'Login Failure': props<{ error: string }>(),
  }
});

// Effects — switchMap (login), exhaustMap (logout), tap (side effects)
// dispatch: false bo'lgan effectlar: navigation, localStorage

// Store registration — app.config.ts da:
provideStore({ auth: authReducer }),
provideEffects([AuthEffects]),
```

Selectors:
```typescript
selectCurrentUser  // User | null
selectAuthLoading  // boolean
selectAuthError    // string | null
selectIsLoggedIn   // boolean
```

---

## Auth Flow

1. **Login** → `AuthActions.login` dispatch
2. **Effect** → `AuthService.login()` HTTP call
3. **loginSuccess** → `tokenService.setToken()`, `setUser()`, navigate `/app/dashboard`
4. **APP_INITIALIZER** → app start bo'lganda localStorage dan user restore
5. **authGuard** → `tokenService.isLoggedIn()` (JWT exp tekshiruvi)
6. **authInterceptor** → har so'rovga `Authorization: Bearer {token}` qo'shadi, 401 da logout

```typescript
// AuthTokenService localStorage keys:
'sos_access_token'   // JWT
'sos_refresh_token'
'sos_user'           // JSON stringified User
```

---

## Role-Based Access

Rollar: `SuperAdmin`, `StoreAdmin`, `Cashier`, `Analyst`

```typescript
// NavItem da:
{ label: 'Tashkilotlar', route: '...', roles: ['SuperAdmin'] }
// roles yo'q = hamma ko'radi

// VisibleForPipe (layout/visible-for.pipe.ts):
item | visibleFor: (user$ | async)?.role
```

Store da `user.role` (string) saqlanadi. Sidebar `VisibleForPipe` orqali filterlaydi.

---

## Multilingual Fields Pattern

Barcha nomlar to'rt tilda:

```typescript
nameUz: string       // O'zbek (lotin) — required
nameRu: string       // Rus — required
nameEn?: string      // Ingliz — optional
nameUzKiril?: string // O'zbek (kiril) — optional
```

Form:
```typescript
form = this.fb.group({
  nameUz:      ['', Validators.required],
  nameRu:      ['', Validators.required],
  nameEn:      [''],
  nameUzKiril: [''],
});
```

---

## SCSS Conventions

### Global page layout (har bir page komponentda):
```scss
.page {
  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }
  .table-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
  .empty-msg { text-align: center; padding: 1rem 0; color: var(--text-secondary); }
}

.dialog-form {
  display: grid;
  gap: 1rem;
}
```

### Sidebar variables (layout.component.scss):
```scss
$sidebar-width: 240px;
$sidebar-collapsed: 64px;
$topbar-height: 56px;
$sidebar-bg: #1e293b;
$sidebar-active: #667eea;
```

---

## HTML Template Pattern

```html
<p-toast />

<div class="page">
  <div class="page-header">
    <div>
      <h1>Sarlavha</h1>
      <p>Tavsif.</p>
    </div>
    <button pButton label="Qo'shish" icon="pi pi-plus" (click)="openCreate()"></button>
  </div>

  <p-table [value]="items()" [loading]="loading()" styleClass="p-datatable-sm">
    <ng-template pTemplate="header">
      <tr><th>Col</th><th style="width:170px">Amallar</th></tr>
    </ng-template>
    <ng-template pTemplate="body" let-item>
      <tr>
        <td>{{ item.nameUz }}</td>
        <td class="table-actions">
          <button pButton icon="pi pi-pencil" [text]="true" severity="secondary" (click)="openEdit(item)"></button>
          <button pButton icon="pi pi-trash" [text]="true" severity="danger" (click)="delete(item)"></button>
        </td>
      </tr>
    </ng-template>
    <ng-template pTemplate="emptymessage">
      <tr><td colspan="2" class="empty-msg">Topilmadi</td></tr>
    </ng-template>
  </p-table>
</div>

<p-dialog header="Dialog" [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
          [modal]="true" [draggable]="false" [style]="{ width: '520px' }">
  <form [formGroup]="form" class="dialog-form">
    <label>Nom UZ</label>
    <input pInputText formControlName="nameUz" />
  </form>
  <ng-template pTemplate="footer">
    <button pButton label="Bekor qilish" [text]="true" severity="secondary" (click)="dialogVisible.set(false)"></button>
    <button pButton label="Saqlash" [disabled]="form.invalid || saving()" (click)="save()"></button>
  </ng-template>
</p-dialog>
```

---

## PrimeNG Components Used

`p-table`, `p-dialog`, `p-toast`, `p-button` (`pButton` directive), `p-inputtext` (`pInputText`),
`p-select`, `p-autocomplete`, `p-inputnumber`, `p-tag`, `p-toolbar`, `p-confirmdialog`,
`p-tabs`, `p-iconfield`, `p-inputicon`

Theme: **Aura** (`@primeuix/themes/aura`), dark mode: `.dark-mode` class.

---

## API Response Models (core/models/api-response.model.ts)

```typescript
interface ApiResponse<T> { data: T; message?: string; success: boolean; }
interface PagedResponse<T> { content: T[]; totalElements: number; totalPages: number; size: number; number: number; }
```

---

## Adding a New Feature — Checklist

1. `src/app/features/<name>/` papka yaratish
2. `<name>.models.ts` — interfacelar (DTO, request, response)
3. `<name>.service.ts` — `ApiService` inject, metodlar
4. `<name>.component.ts` — standalone, signals, `inject()`, `providers: [MessageService]`
5. `<name>.component.html` — `p-toast` + `.page` wrapper + `p-table` + `p-dialog`
6. `<name>.component.scss` — `.page` va `.dialog-form` pattern
7. `app.routes.ts` da lazy route qo'shish
8. `layout.component.ts` dagi `NAV_ITEMS` ga qo'shish (roles bilan)
9. Agar core/catalog/commerce servisi bo'lsa — `CoreApiService` ga DTO + metod qo'shish
