import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { catchError, Observable, of } from 'rxjs';
import { CoreApiService, BrandDto } from '../../../core/services/core-api.service';

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, ButtonModule, ToastModule, DialogModule, InputTextModule],
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

  brands = signal<BrandDto[]>([]);

  dialogVisible = signal(false);
  editMode      = signal(false);
  selected      = signal<BrandDto | null>(null);

  form = this.fb.group({
    nameUz:      ['', Validators.required],
    nameRu:      ['', Validators.required],
    nameEn:      [''],
    nameUzKiril: [''],
  });

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.svc.getBrands().pipe(catchError(() => of([] as BrandDto[]))).subscribe(data => {
      this.brands.set(data);
      this.loading.set(false);
    });
  }

  openCreate(): void {
    this.editMode.set(false);
    this.selected.set(null);
    this.form.reset({ nameUz: '', nameRu: '', nameEn: '', nameUzKiril: '' });
    this.dialogVisible.set(true);
  }

  openEdit(brand: BrandDto): void {
    this.editMode.set(true);
    this.selected.set(brand);
    this.form.patchValue({
      nameUz: brand.nameUz ?? '',
      nameRu: brand.nameRu ?? '',
      nameEn: brand.nameEn ?? '',
      nameUzKiril: brand.nameUzKiril ?? '',
    });
    this.dialogVisible.set(true);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const data = this.form.getRawValue() as {
      nameUz: string | null;
      nameRu: string | null;
      nameEn: string | null;
      nameUzKiril: string | null;
    };
    const request = {
      nameUz: data.nameUz ?? '',
      nameRu: data.nameRu ?? '',
      nameEn: data.nameEn ?? undefined,
      nameUzKiril: data.nameUzKiril ?? undefined,
    };

    const action$: Observable<unknown> = this.editMode() && this.selected()
      ? this.svc.updateBrand(this.selected()!.id, request)
      : this.svc.createBrand(request);

    action$.pipe(catchError(err => {
      this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Xato' });
      this.saving.set(false);
      return of(null);
    })).subscribe(() => {
      this.toast.add({ severity: 'success', summary: this.editMode() ? 'O‘zgartirildi' : 'Yaratildi', detail: data.nameUz ?? '' });
      this.saving.set(false);
      this.dialogVisible.set(false);
      this.load();
    });
  }

  delete(brand: BrandDto): void {
    if (!confirm(`"${brand.nameUz}" brendini o'chirishni xohlaysizmi?`)) return;
    this.svc.deleteBrand(brand.id).pipe(catchError(err => {
      this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Xato' });
      return of(undefined);
    })).subscribe(() => {
      this.toast.add({ severity: 'success', summary: 'O‘chirildi', detail: brand.nameUz });
      this.load();
    });
  }
}
