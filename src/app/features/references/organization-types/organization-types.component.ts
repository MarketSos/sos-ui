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
import { CoreApiService, OrgTypeDto } from '../../../core/services/core-api.service';

@Component({
  selector: 'app-organization-types',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, ButtonModule, ToastModule, DialogModule, InputTextModule],
  providers: [MessageService],
  templateUrl: './organization-types.component.html',
  styleUrls: ['./organization-types.component.scss'],
})
export class OrganizationTypesComponent implements OnInit {
  private svc   = inject(CoreApiService);
  private fb    = inject(FormBuilder);
  private toast = inject(MessageService);

  loading = signal(true);
  saving  = signal(false);

  organizationTypes = signal<OrgTypeDto[]>([]);

  dialogVisible = signal(false);
  editMode      = signal(false);
  selected      = signal<OrgTypeDto | null>(null);

  form = this.fb.group({
    code:   ['', Validators.required],
    nameUz: ['', Validators.required],
    nameRu: ['', Validators.required],
    nameEn: [''],
    icon:   [''],
  });

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.svc.getOrgTypes().pipe(catchError(() => of([] as OrgTypeDto[]))).subscribe(data => {
      this.organizationTypes.set(data);
      this.loading.set(false);
    });
  }

  openCreate(): void {
    this.editMode.set(false);
    this.selected.set(null);
    this.form.reset({ code: '', nameUz: '', nameRu: '', nameEn: '', icon: '' });
    this.form.get('code')?.enable();
    this.dialogVisible.set(true);
  }

  openEdit(orgType: OrgTypeDto): void {
    this.editMode.set(true);
    this.selected.set(orgType);
    this.form.patchValue({
      code: orgType.code ?? '',
      nameUz: orgType.nameUz ?? '',
      nameRu: orgType.nameRu ?? '',
      nameEn: orgType.nameEn ?? '',
      icon: orgType.icon ?? '',
    });
    this.form.get('code')?.disable();
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
      icon: string | null;
    };
    const request = {
      nameUz: data.nameUz ?? '',
      nameRu: data.nameRu ?? '',
      nameEn: data.nameEn ?? undefined,
      icon: data.icon ?? undefined,
    };

    const action$: Observable<unknown> = this.editMode() && this.selected()
      ? this.svc.updateOrgType(this.selected()!.id, request)
      : this.svc.createOrgType({ code: data.code ?? '', ...request });

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

  delete(orgType: OrgTypeDto): void {
    if (!confirm(`"${orgType.nameUz}" tashkilot turini o'chirishni xohlaysizmi?`)) return;
    this.svc.deleteOrgType(orgType.id).pipe(catchError(err => {
      this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Xato' });
      return of(undefined);
    })).subscribe(() => {
      this.toast.add({ severity: 'success', summary: 'O‘chirildi', detail: orgType.nameUz });
      this.load();
    });
  }
}
