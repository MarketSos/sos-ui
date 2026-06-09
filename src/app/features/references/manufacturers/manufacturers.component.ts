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
import { CoreApiService, ManufacturerDto } from '../../../core/services/core-api.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { EntityNamePipe } from '../../../core/i18n/entity-name.pipe';
import { LocaleService } from '../../../core/i18n/locale.service';

@Component({
  selector: 'app-manufacturers',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, ButtonModule, ToastModule, DialogModule, InputTextModule, TranslatePipe, EntityNamePipe],
  providers: [MessageService],
  templateUrl: './manufacturers.component.html',
  styleUrls: ['./manufacturers.component.scss'],
})
export class ManufacturersComponent implements OnInit {
  private svc   = inject(CoreApiService);
  private fb    = inject(FormBuilder);
  private toast = inject(MessageService);
  locale        = inject(LocaleService);

  loading = signal(true);
  saving  = signal(false);

  manufacturers = signal<ManufacturerDto[]>([]);

  dialogVisible = signal(false);
  editMode      = signal(false);
  selected      = signal<ManufacturerDto | null>(null);

  form = this.fb.group({
    nameUz:      ['', Validators.required],
    nameRu:      ['', Validators.required],
    nameEn:      [''],
    nameUzKiril: [''],
  });

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.svc.getManufacturers().pipe(catchError(() => of([] as ManufacturerDto[]))).subscribe(data => {
      this.manufacturers.set(data);
      this.loading.set(false);
    });
  }

  openCreate(): void {
    this.editMode.set(false);
    this.selected.set(null);
    this.form.reset({ nameUz: '', nameRu: '', nameEn: '', nameUzKiril: '' });
    this.dialogVisible.set(true);
  }

  openEdit(manufacturer: ManufacturerDto): void {
    this.editMode.set(true);
    this.selected.set(manufacturer);
    this.form.patchValue({
      nameUz:      manufacturer.nameUz      ?? '',
      nameRu:      manufacturer.nameRu      ?? '',
      nameEn:      manufacturer.nameEn      ?? '',
      nameUzKiril: manufacturer.nameUzKiril ?? '',
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
      nameUz:      data.nameUz      ?? '',
      nameRu:      data.nameRu      ?? '',
      nameEn:      data.nameEn      ?? undefined,
      nameUzKiril: data.nameUzKiril ?? undefined,
    };

    const action$: Observable<unknown> = this.editMode() && this.selected()
      ? this.svc.updateManufacturer(this.selected()!.id, request)
      : this.svc.createManufacturer(request);

    action$.pipe(catchError(err => {
      this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Xato' });
      this.saving.set(false);
      return of(null);
    })).subscribe(() => {
      this.toast.add({ severity: 'success', summary: this.editMode() ? "O'zgartirildi" : 'Yaratildi', detail: data.nameUz ?? '' });
      this.saving.set(false);
      this.dialogVisible.set(false);
      this.load();
    });
  }

  delete(manufacturer: ManufacturerDto): void {
    if (!confirm(`"${manufacturer.nameUz}" ishlab chiqaruvchisini o'chirishni xohlaysizmi?`)) return;
    this.svc.deleteManufacturer(manufacturer.id).pipe(catchError(err => {
      this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Xato' });
      return of(undefined);
    })).subscribe(() => {
      this.toast.add({ severity: 'success', summary: "O'chirildi", detail: manufacturer.nameUz });
      this.load();
    });
  }
}
