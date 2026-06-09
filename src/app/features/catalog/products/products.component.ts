import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmationService, MessageService } from 'primeng/api';
import { catchError, of, forkJoin, debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { ProductsService } from './products.service';
import { Product, Sku, MeasurementUnit, Category, CreateSkuRequest } from './products.models';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { EntityNamePipe } from '../../../core/i18n/entity-name.pipe';
import { LocaleService } from '../../../core/i18n/locale.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    TableModule, ButtonModule, DialogModule,
    InputTextModule, InputNumberModule, SelectModule, AutoCompleteModule,
    TagModule, ToolbarModule, ConfirmDialogModule,
    ToastModule, TabsModule, IconFieldModule, InputIconModule,
    TranslatePipe, EntityNamePipe,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  private svc     = inject(ProductsService);
  private fb      = inject(FormBuilder);
  private toast   = inject(MessageService);
  locale          = inject(LocaleService);

  products   = signal<Product[]>([]);
  skus       = signal<Sku[]>([]);
  units      = signal<MeasurementUnit[]>([]);
  allCategories     = signal<Category[]>([]);
  filteredCategories = signal<Category[]>([]);
  selectedCategory  = signal<Category | null>(null);

  loading    = signal(true);
  skuLoading = signal(false);
  saving     = signal(false);

  searchQuery = '';
  private search$ = new Subject<string>();

  createDialogVisible = signal(false);
  skuDialogVisible    = signal(false);
  selectedProduct     = signal<Product | null>(null);

  createForm = this.fb.group({
    nameUz:      ['', [Validators.required, Validators.minLength(2)]],
    nameRu:      ['', [Validators.required, Validators.minLength(2)]],
    nameEn:      [''],
    nameUzKiril: [''],
    barcode:     ['', [Validators.required]],
  });

  serialLoading = signal(false);

  skuForm = this.fb.group({
    serialNumber:      ['', Validators.required],
    measurementUnitId: ['', Validators.required],
    amount:            [1,  [Validators.required, Validators.min(0.001)]],
    costPrice:         [0,  [Validators.required, Validators.min(0)]],
    salePrice:         [0,  [Validators.required, Validators.min(0)]],
    expirationDate:    [''],
  });

  ngOnInit(): void {
    this.load();
    this.svc.getMeasurementUnits().pipe(catchError(() => of([]))).subscribe(u => this.units.set(u));
    this.svc.getCategories().pipe(catchError(() => of([]))).subscribe(c => this.allCategories.set(c));
    this.search$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(q => this.svc.search(q || undefined).pipe(catchError(() => of([]))))
    ).subscribe(data => { this.products.set(data); this.loading.set(false); });
  }

  private load(): void {
    this.loading.set(true);
    this.svc.search().pipe(catchError(() => of([]))).subscribe(data => {
      this.products.set(data);
      this.loading.set(false);
    });
  }

  onSearch(q: string): void {
    this.loading.set(true);
    this.search$.next(q);
  }

  // ── Category AutoComplete ─────────────────────────────────────────────────
  filterCategories(event: { query: string }): void {
    const q = event.query.toLowerCase();
    this.filteredCategories.set(
      this.allCategories().filter(c =>
        c.nameUz.toLowerCase().includes(q) ||
        c.nameRu.toLowerCase().includes(q) ||
        (c.nameEn?.toLowerCase().includes(q) ?? false)
      )
    );
  }

  get isCategorySelected(): boolean {
    return this.selectedCategory() !== null;
  }

  // ── Create Product ────────────────────────────────────────────────────────
  openCreate(): void {
    this.createForm.reset();
    this.selectedCategory.set(null);
    this.createDialogVisible.set(true);
  }

  saveProduct(): void {
    if (this.createForm.invalid || !this.selectedCategory()) return;
    this.saving.set(true);
    const v   = this.createForm.getRawValue();
    const cat = this.selectedCategory()!;

    this.svc.create({
      nameUz:      v.nameUz!,
      nameRu:      v.nameRu!,
      nameEn:      v.nameEn   || undefined,
      nameUzKiril: v.nameUzKiril || undefined,
      barcode:     v.barcode!,
      categoryId:  cat.id,
    }).pipe(catchError(err => {
      this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Yaratishda xato' });
      this.saving.set(false);
      return of(null);
    })).subscribe(res => {
      if (!res) return;
      this.saving.set(false);
      this.toast.add({ severity: 'success', summary: 'Yaratildi', detail: v.nameUz! });
      this.createDialogVisible.set(false);
      this.load();
    });
  }

  private localSerial(count: number): string {
    const d  = new Date();
    const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    return `BATCH-${ym}-${String(count).padStart(3, '0')}`;
  }

  // ── SKU ───────────────────────────────────────────────────────────────────
  fetchNextSerial(): void {
    const product = this.selectedProduct();
    if (!product) return;
    this.serialLoading.set(true);
    this.svc.getNextSerial(product.id).pipe(
      catchError(() => of({ serialNumber: this.localSerial(this.skus().length + 1) }))
    ).subscribe(res => {
      this.serialLoading.set(false);
      this.skuForm.patchValue({ serialNumber: res.serialNumber });
    });
  }

  openSkus(product: Product): void {
    this.selectedProduct.set(product);
    this.skuLoading.set(true);
    this.skuDialogVisible.set(true);
    this.skuForm.reset({ amount: 1, costPrice: 0, salePrice: 0 });

    forkJoin({
      skus:   this.svc.getSkus(product.id).pipe(catchError(() => of([]))),
      serial: this.svc.getNextSerial(product.id).pipe(catchError(() => of(null))),
    }).subscribe(({ skus, serial }) => {
      this.skus.set(skus);
      this.skuLoading.set(false);
      const serialNum = serial?.serialNumber ?? this.localSerial(skus.length + 1);
      this.skuForm.patchValue({ serialNumber: serialNum });
    });
  }

  saveSku(): void {
    if (this.skuForm.invalid || !this.selectedProduct()) return;
    this.saving.set(true);
    const v = this.skuForm.getRawValue();
    const req: CreateSkuRequest = {
      serialNumber:      v.serialNumber!,
      measurementUnitId: v.measurementUnitId!,
      amount:            v.amount!,
      costPrice:         v.costPrice!,
      salePrice:         v.salePrice!,
      expirationDate:    v.expirationDate || undefined,
    };
    this.svc.createSku(this.selectedProduct()!.id, req)
      .pipe(catchError(err => {
        this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Xato' });
        this.saving.set(false);
        return of(null);
      }))
      .subscribe(res => {
        if (!res) return;
        this.saving.set(false);
        this.toast.add({ severity: 'success', summary: "SKU qo'shildi", detail: v.serialNumber! });
        this.skuForm.reset({ amount: 1, costPrice: 0, salePrice: 0 });
        this.svc.getSkus(this.selectedProduct()!.id)
          .pipe(catchError(() => of([])))
          .subscribe(d => this.skus.set(d));
      });
  }

  unitLabel(id: string): string {
    return this.units().find(u => u.id === id)?.code ?? '—';
  }

  categoryLabel(id: string): string {
    return this.allCategories().find(c => c.id === id)?.nameUz ?? '—';
  }

  formatPrice(n: number): string {
    return new Intl.NumberFormat('uz-UZ').format(n);
  }
}
