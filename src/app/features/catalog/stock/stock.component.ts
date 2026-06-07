import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectButtonModule } from 'primeng/selectbutton';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { catchError, of, Observable } from 'rxjs';
import { StockService } from './stock.service';
import { StockItem } from './stock.models';

type DialogMode = 'add' | 'deduct' | 'min';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    TableModule, ButtonModule, TagModule, ToastModule,
    DialogModule, InputNumberModule, SelectButtonModule,
    IconFieldModule, InputIconModule, InputTextModule,
  ],
  providers: [MessageService],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss'],
})
export class StockComponent implements OnInit {
  private svc   = inject(StockService);
  private fb    = inject(FormBuilder);
  private toast = inject(MessageService);

  items       = signal<StockItem[]>([]);
  loading     = signal(true);
  saving      = signal(false);
  searchQuery = '';

  filterOptions = [
    { label: 'Barchasi', value: 'all' },
    { label: 'Kam qolgan', value: 'low' },
  ];
  activeFilter = signal<'all' | 'low'>('all');

  displayedItems = computed(() => {
    let list = this.items();
    if (this.activeFilter() === 'low') list = list.filter(i => i.isLow);
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(i =>
        i.productNameUz.toLowerCase().includes(q) ||
        i.productNameRu.toLowerCase().includes(q) ||
        i.barcode.toLowerCase().includes(q)
      );
    }
    return list;
  });

  lowCount = computed(() => this.items().filter(i => i.isLow).length);

  // Dialog
  dialogVisible = signal(false);
  dialogMode    = signal<DialogMode>('add');
  selectedItem  = signal<StockItem | null>(null);

  form = this.fb.group({
    amount: [1, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getList().pipe(catchError(() => of([]))).subscribe(data => {
      this.items.set(data);
      this.loading.set(false);
    });
  }

  onSearch(q: string): void {
    this.searchQuery = q;
  }

  openDialog(item: StockItem, mode: DialogMode): void {
    this.selectedItem.set(item);
    this.dialogMode.set(mode);
    this.form.reset({ amount: mode === 'min' ? item.minQuantity : 1 });
    this.dialogVisible.set(true);
  }

  save(): void {
    if (this.form.invalid || !this.selectedItem()) return;
    this.saving.set(true);
    const item   = this.selectedItem()!;
    const amount = this.form.getRawValue().amount!;
    const mode   = this.dialogMode();

    let req$: Observable<void>;
    if      (mode === 'add')    req$ = this.svc.add(item.productId, item.storeId, amount);
    else if (mode === 'deduct') req$ = this.svc.deduct(item.productId, item.storeId, amount);
    else                        req$ = this.svc.updateMinQuantity(item.productId, item.storeId, amount);

    req$.pipe(catchError(err => {
      this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Xato yuz berdi' });
      this.saving.set(false);
      return of(undefined);
    })).subscribe(() => {
      this.saving.set(false);
      const labels: Record<DialogMode, string> = { add: 'Qo\'shildi', deduct: 'Chiqarildi', min: 'Yangilandi' };
      this.toast.add({ severity: 'success', summary: labels[mode], detail: item.productNameUz });
      this.dialogVisible.set(false);
      this.load();
    });
  }

  get dialogTitle(): string {
    const m = this.dialogMode();
    if (m === 'add')    return 'Kirim (qo\'shish)';
    if (m === 'deduct') return 'Chiqim (sarflash)';
    return 'Minimal miqdor sozlash';
  }

  get dialogLabel(): string {
    const m = this.dialogMode();
    if (m === 'min') return 'Minimal miqdor';
    return 'Miqdor';
  }
}
