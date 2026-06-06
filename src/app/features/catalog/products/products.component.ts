import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmationService, MessageService } from 'primeng/api';
import { catchError, of, debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { ProductsService } from './products.service';
import { Product, Sku, MeasurementUnit, CreateSkuRequest } from './products.models';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    TableModule, ButtonModule, DialogModule,
    InputTextModule, InputNumberModule, SelectModule,
    TagModule, ToolbarModule, ConfirmDialogModule,
    ToastModule, TabsModule, IconFieldModule, InputIconModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  private svc     = inject(ProductsService);
  private fb      = inject(FormBuilder);
  private confirm = inject(ConfirmationService);
  private toast   = inject(MessageService);

  products    = signal<Product[]>([]);
  skus        = signal<Sku[]>([]);
  units       = signal<MeasurementUnit[]>([]);
  loading     = signal(true);
  skuLoading  = signal(false);
  saving      = signal(false);

  searchQuery = '';
  private search$ = new Subject<string>();

  // Dialogs
  createDialogVisible = signal(false);
  skuDialogVisible    = signal(false);
  selectedProduct     = signal<Product | null>(null);

  createForm = this.fb.group({
    nameUz:     ['', [Validators.required, Validators.minLength(2)]],
    nameRu:     ['', [Validators.required, Validators.minLength(2)]],
    barcode:    ['', [Validators.required]],
    categoryId: ['', [Validators.required]],
  });

  skuForm = this.fb.group({
    serialNumber:      ['', Validators.required],
    measurementUnitId: ['', Validators.required],
    amount:            [1, [Validators.required, Validators.min(0.001)]],
    costPrice:         [0, [Validators.required, Validators.min(0)]],
    salePrice:         [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.load();
    this.svc.getMeasurementUnits().pipe(catchError(() => of([]))).subscribe(u => this.units.set(u));
    this.search$.pipe(debounceTime(400), distinctUntilChanged(),
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

  // ── Create Product ────────────────────────────────────────────────────────
  openCreate(): void {
    this.createForm.reset();
    this.createDialogVisible.set(true);
  }

  saveProduct(): void {
    if (this.createForm.invalid) return;
    this.saving.set(true);
    const v = this.createForm.getRawValue();
    this.svc.create({ nameUz: v.nameUz!, nameRu: v.nameRu!, barcode: v.barcode!, categoryId: v.categoryId! })
      .pipe(catchError(err => {
        this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Yaratishda xato' });
        this.saving.set(false);
        return of(null);
      }))
      .subscribe(res => {
        if (!res) return;
        this.saving.set(false);
        this.toast.add({ severity: 'success', summary: 'Yaratildi', detail: v.nameUz! });
        this.createDialogVisible.set(false);
        this.load();
      });
  }

  // ── SKU ───────────────────────────────────────────────────────────────────
  openSkus(product: Product): void {
    this.selectedProduct.set(product);
    this.skuLoading.set(true);
    this.skuDialogVisible.set(true);
    this.skuForm.reset({ amount: 1, costPrice: 0, salePrice: 0 });
    this.svc.getSkus(product.id).pipe(catchError(() => of([]))).subscribe(data => {
      this.skus.set(data);
      this.skuLoading.set(false);
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
        this.toast.add({ severity: 'success', summary: 'SKU qo\'shildi', detail: v.serialNumber! });
        this.skuForm.reset({ amount: 1, costPrice: 0, salePrice: 0 });
        this.svc.getSkus(this.selectedProduct()!.id).pipe(catchError(() => of([]))).subscribe(d => this.skus.set(d));
      });
  }

  unitLabel(id: string): string {
    return this.units().find(u => u.id === id)?.code ?? id;
  }

  formatPrice(n: number): string {
    return new Intl.NumberFormat('uz-UZ').format(n);
  }
}
