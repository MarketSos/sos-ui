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
import { CoreApiService, SpecializationDto } from '../../../core/services/core-api.service';

@Component({
  selector: 'app-specializations',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, ButtonModule, ToastModule, DialogModule, InputTextModule],
  providers: [MessageService],
  templateUrl: './specializations.component.html',
  styleUrls: ['./specializations.component.scss'],
})
export class SpecializationsComponent implements OnInit {
  private svc   = inject(CoreApiService);
  private fb    = inject(FormBuilder);
  private toast = inject(MessageService);

  loading = signal(true);
  saving  = signal(false);

  specializations = signal<SpecializationDto[]>([]);

  dialogVisible = signal(false);
  editMode      = signal(false);
  selected      = signal<SpecializationDto | null>(null);

  form = this.fb.group({
    code:        ['', Validators.required],
    nameUz:      ['', Validators.required],
    nameRu:      ['', Validators.required],
    nameEn:      [''],
    nameUzKiril: [''],
  });

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.svc.getSpecializations().pipe(catchError(() => of([] as SpecializationDto[]))).subscribe(data => {
      this.specializations.set(data);
      this.loading.set(false);
    });
  }

  openCreate(): void {
    this.editMode.set(false);
    this.selected.set(null);
    this.form.reset({ code: '', nameUz: '', nameRu: '', nameEn: '', nameUzKiril: '' });
    this.dialogVisible.set(true);
  }

  openEdit(spec: SpecializationDto): void {
    this.editMode.set(true);
    this.selected.set(spec);
    this.form.patchValue({
      code: spec.code ?? '',
      nameUz: spec.nameUz ?? '',
      nameRu: spec.nameRu ?? '',
      nameEn: spec.nameEn ?? '',
      nameUzKiril: spec.nameUzKiril ?? '',
    });
    this.dialogVisible.set(true);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const data = this.form.getRawValue() as {
      code: string | null;
      nameUz: string | null;
      nameRu: string | null;
      nameEn: string | null;
      nameUzKiril: string | null;
    };
    const request = {
      code: data.code ?? '',
      nameUz: data.nameUz ?? '',
      nameRu: data.nameRu ?? '',
      nameEn: data.nameEn ?? undefined,
      nameUzKiril: data.nameUzKiril ?? undefined,
    };

    const action$: Observable<unknown> = this.editMode() && this.selected()
      ? this.svc.updateSpecialization(this.selected()!.id, request)
      : this.svc.createSpecialization(request);

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

  delete(spec: SpecializationDto): void {
    if (!confirm(`"${spec.nameUz}" mutaxassisligini o'chirishni xohlaysizmi?`)) return;
    this.svc.deleteSpecialization(spec.id).pipe(catchError(err => {
      this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Xato' });
      return of(undefined);
    })).subscribe(() => {
      this.toast.add({ severity: 'success', summary: 'O‘chirildi', detail: spec.nameUz });
      this.load();
    });
  }
}
