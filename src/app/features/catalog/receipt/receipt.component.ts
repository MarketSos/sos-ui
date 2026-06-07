import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { StepperModule } from 'primeng/stepper';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { catchError, of } from 'rxjs';

function localSerial(count: number): string {
  const d  = new Date();
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  return `BATCH-${ym}-${String(count).padStart(3, '0')}`;
}
import { ProductsService } from '../products/products.service';
import { Product, Category, MeasurementUnit } from '../products/products.models';

export type ReceiptStep = 'search' | 'sku' | 'new-product';

export interface ReceiptLine {
  product: Product;
  serialNumber: string;
  measurementUnit: MeasurementUnit;
  amount: number;
  costPrice: number;
  salePrice: number;
  expirationDate?: string;
  saved: boolean;
}

@Component({
  selector: 'app-stock-receipt',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    InputTextModule, InputNumberModule, ButtonModule,
    TableModule, TagModule, ToastModule, DividerModule,
    StepperModule, SelectModule, AutoCompleteModule,
    IconFieldModule, InputIconModule, MessageModule,
  ],
  providers: [MessageService],
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss'],
})
export class StockReceiptComponent implements OnInit {
  private svc   = inject(ProductsService);
  private fb    = inject(FormBuilder);
  private toast = inject(MessageService);

  // ── State ──────────────────────────────────────────────────────────────────
  step            = signal<ReceiptStep>('search');
  searching       = signal(false);
  saving          = signal(false);
  submitting      = signal(false);
  foundProduct    = signal<Product | null>(null);
  barcodeQuery    = '';
  lines           = signal<ReceiptLine[]>([]);

  // ── Reference data ─────────────────────────────────────────────────────────
  units              = signal<MeasurementUnit[]>([]);
  allCategories      = signal<Category[]>([]);
  filteredCategories = signal<Category[]>([]);
  selectedCategory   = signal<Category | null>(null);

  // ── Forms ─────────────────────────────────────────────────────────────────
  newProductForm: FormGroup = this.fb.group({
    nameUz:  ['', [Validators.required, Validators.minLength(2)]],
    nameRu:  ['', [Validators.required, Validators.minLength(2)]],
    barcode: ['', [Validators.required]],
  });

  serialLoading = signal(false);

  skuForm: FormGroup = this.fb.group({
    serialNumber:      ['', Validators.required],
    measurementUnitId: ['', Validators.required],
    amount:            [1,  [Validators.required, Validators.min(0.001)]],
    costPrice:         [0,  [Validators.required, Validators.min(0)]],
    salePrice:         [0,  [Validators.required, Validators.min(0)]],
    expirationDate:    [''],
  });

  totalLines    = computed(() => this.lines().length);
  pendingLines  = computed(() => this.lines().filter(l => !l.saved).length);
  totalCost     = computed(() => this.lines().reduce((s, l) => s + l.amount * l.costPrice, 0));

  ngOnInit(): void {
    this.svc.getMeasurementUnits().pipe(catchError(() => of([]))).subscribe(u => this.units.set(u));
    this.svc.getCategories().pipe(catchError(() => of([]))).subscribe(c => this.allCategories.set(c));
  }

  // ── Search ────────────────────────────────────────────────────────────────
  searchByBarcode(): void {
    const q = this.barcodeQuery.trim();
    if (!q) return;
    this.searching.set(true);
    this.foundProduct.set(null);

    this.svc.getByBarcode(q).pipe(
      catchError(() => {
        // Barcode bo'yicha topilmadi — nom bo'yicha qidirish
        return this.svc.search(q).pipe(catchError(() => of([])));
      })
    ).subscribe(result => {
      this.searching.set(false);
      if (Array.isArray(result)) {
        // search natijasi
        if (result.length === 1) {
          this.goToSku(result[0]);
        } else if (result.length === 0) {
          this.goToNewProduct(q);
        } else {
          // Bir nechta natija — birinchisini ol (yaxshilash mumkin)
          this.goToSku(result[0]);
        }
      } else {
        // Bitta mahsulot topildi
        this.goToSku(result as Product);
      }
    });
  }

  onBarcodeKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.searchByBarcode();
  }

  // ── Step transitions ──────────────────────────────────────────────────────
  fetchNextSerial(): void {
    const product = this.foundProduct();
    if (!product) return;
    this.serialLoading.set(true);
    this.svc.getNextSerial(product.id).pipe(
      catchError(() => of({ serialNumber: localSerial(this.lines().length + 1) }))
    ).subscribe(res => {
      this.serialLoading.set(false);
      this.skuForm.patchValue({ serialNumber: res.serialNumber });
    });
  }

  goToSku(product: Product): void {
    this.foundProduct.set(product);
    this.skuForm.reset({ amount: 1, costPrice: 0, salePrice: 0 });
    this.step.set('sku');
    this.svc.getNextSerial(product.id).pipe(
      catchError(() => of({ serialNumber: localSerial(this.lines().length + 1) }))
    ).subscribe(res => {
      this.skuForm.patchValue({ serialNumber: res.serialNumber });
    });
  }

  goToNewProduct(barcode = ''): void {
    this.newProductForm.reset();
    this.newProductForm.patchValue({ barcode });
    this.selectedCategory.set(null);
    this.step.set('new-product');
  }

  backToSearch(): void {
    this.foundProduct.set(null);
    this.step.set('search');
  }

  // ── Create product then go to SKU ─────────────────────────────────────────
  createProductAndContinue(): void {
    if (this.newProductForm.invalid || !this.selectedCategory()) return;
    this.saving.set(true);
    const v = this.newProductForm.getRawValue();

    this.svc.create({
      nameUz:     v.nameUz,
      nameRu:     v.nameRu,
      barcode:    v.barcode,
      categoryId: this.selectedCategory()!.id,
    }).pipe(catchError(err => {
      this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Yaratishda xato' });
      this.saving.set(false);
      return of(null);
    })).subscribe(res => {
      if (!res) return;
      this.saving.set(false);
      this.toast.add({ severity: 'success', summary: 'Mahsulot yaratildi', detail: v.nameUz });
      // Yaratilgan mahsulotni barcode orqali olish
      this.svc.getByBarcode(v.barcode).pipe(catchError(() => of(null))).subscribe(p => {
        if (p) this.goToSku(p as Product);
      });
    });
  }

  // ── Add SKU line ──────────────────────────────────────────────────────────
  addLine(): void {
    if (this.skuForm.invalid || !this.foundProduct()) return;
    const v    = this.skuForm.getRawValue();
    const unit = this.units().find(u => u.id === v.measurementUnitId)!;

    const line: ReceiptLine = {
      product:         this.foundProduct()!,
      serialNumber:    v.serialNumber,
      measurementUnit: unit,
      amount:          v.amount,
      costPrice:       v.costPrice,
      salePrice:       v.salePrice,
      expirationDate:  v.expirationDate || undefined,
      saved:           false,
    };

    this.lines.update(l => [...l, line]);
    this.toast.add({ severity: 'info', summary: "Ro'yxatga qo'shildi", detail: line.product.nameUz });
    this.backToSearch();
    this.barcodeQuery = '';
  }

  removeLine(index: number): void {
    this.lines.update(l => l.filter((_, i) => i !== index));
  }

  // ── Submit all ────────────────────────────────────────────────────────────
  submitAll(): void {
    const pending = this.lines().filter(l => !l.saved);
    if (!pending.length) return;
    this.submitting.set(true);

    const reqs = pending.map(line =>
      this.svc.createSku(line.product.id, {
        serialNumber:      line.serialNumber,
        measurementUnitId: line.measurementUnit.id,
        amount:            line.amount,
        costPrice:         line.costPrice,
        salePrice:         line.salePrice,
        expirationDate:    line.expirationDate,
      }).pipe(catchError(() => of(null)))
    );

    let done = 0;
    reqs.forEach((req$, i) => {
      req$.subscribe(res => {
        if (res !== null) {
          this.lines.update(list =>
            list.map((l, idx) => {
              const lineIdx = this.lines().findIndex((_, j) => !this.lines()[j].saved);
              return idx === i ? { ...l, saved: true } : l;
            })
          );
        }
        done++;
        if (done === reqs.length) {
          this.submitting.set(false);
          const successCount = this.lines().filter(l => l.saved).length;
          this.toast.add({
            severity: 'success',
            summary: 'Qabul yakunlandi',
            detail: `${successCount} ta mahsulot omborga kiritildi`,
          });
        }
      });
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  filterCategories(event: { query: string }): void {
    const q = event.query.toLowerCase();
    this.filteredCategories.set(
      this.allCategories().filter(c =>
        c.nameUz.toLowerCase().includes(q) || c.nameRu.toLowerCase().includes(q)
      )
    );
  }

  formatPrice(n: number): string {
    return new Intl.NumberFormat('uz-UZ').format(n);
  }
}
