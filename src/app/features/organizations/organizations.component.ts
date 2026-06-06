import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { catchError, of } from 'rxjs';
import { OrganizationsService } from './organizations.service';
import { OrganizationSummary, OrganizationType } from './organizations.models';

const ORG_TYPES: { label: string; value: OrganizationType }[] = [
  { label: 'Markaziy',  value: 'Central'   },
  { label: 'Viloyat',   value: 'Regional'  },
  { label: 'Shahar',    value: 'Municipal' },
  { label: 'Tuman',     value: 'District'  },
  { label: 'Qishloq',   value: 'Rural'     },
];

@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule, ButtonModule, DialogModule,
    InputTextModule, SelectModule, TagModule,
    ToolbarModule, ConfirmDialogModule, ToastModule,
    ToggleSwitchModule, TooltipModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss'],
})
export class OrganizationsComponent implements OnInit {
  private svc     = inject(OrganizationsService);
  private fb      = inject(FormBuilder);
  private confirm = inject(ConfirmationService);
  private toast   = inject(MessageService);

  orgs          = signal<OrganizationSummary[]>([]);
  loading       = signal(true);
  dialogVisible = signal(false);
  saving        = signal(false);
  editingId     = signal<string | null>(null);

  orgTypes = ORG_TYPES;

  form = this.fb.group({
    nameUz:  ['', [Validators.required, Validators.minLength(2)]],
    nameRu:  ['', [Validators.required, Validators.minLength(2)]],
    slug:    ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
    code:    [''],
    tin:     [''],
    orgType: [null as OrganizationType | null],
  });

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.svc.getAll().pipe(catchError(() => of([]))).subscribe(data => {
      this.orgs.set(data);
      this.loading.set(false);
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ orgType: null });
    this.form.get('slug')?.enable();
    this.dialogVisible.set(true);
  }

  openEdit(org: OrganizationSummary): void {
    this.editingId.set(org.id);
    this.form.patchValue({ nameUz: org.nameUz, nameRu: org.nameRu, slug: org.slug ?? '', code: org.code ?? '' });
    this.form.get('slug')?.disable();
    this.dialogVisible.set(true);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v  = this.form.getRawValue();
    const id = this.editingId();

    const req$: Observable<unknown> = id
      ? this.svc.updateNames(id, { nameUz: v.nameUz!, nameRu: v.nameRu! })
      : this.svc.create({ nameUz: v.nameUz!, nameRu: v.nameRu!, slug: v.slug!, code: v.code || undefined, tin: v.tin || undefined, orgType: v.orgType ?? undefined });

    req$.pipe(catchError(err => {
      this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Saqlashda xato' });
      this.saving.set(false);
      return of(null);
    })).subscribe(() => {
      this.saving.set(false);
      this.toast.add({ severity: 'success', summary: 'Muvaffaqiyatli', detail: id ? 'Yangilandi' : 'Yaratildi' });
      this.dialogVisible.set(false);
      this.load();
    });
  }

  toggleStatus(org: OrganizationSummary): void {
    this.svc.toggleStatus(org.id, !org.isActive).pipe(
      catchError(err => {
        this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Xato' });
        return of(undefined);
      })
    ).subscribe(() => {
      this.orgs.update(list => list.map(o => o.id === org.id ? { ...o, isActive: !o.isActive } : o));
    });
  }

  confirmDelete(org: OrganizationSummary): void {
    this.confirm.confirm({
      message:                 `"${org.nameUz}" ni o'chirishni tasdiqlaysizmi?`,
      header:                  "O'chirish",
      icon:                    'pi pi-exclamation-triangle',
      acceptLabel:             "O'chirish",
      rejectLabel:             'Bekor qilish',
      acceptButtonStyleClass:  'p-button-danger',
      accept: () => {
        this.svc.delete(org.id).pipe(
          catchError(err => {
            this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Xato' });
            return of(undefined);
          })
        ).subscribe(() => {
          this.toast.add({ severity: 'success', summary: "O'chirildi", detail: org.nameUz });
          this.orgs.update(list => list.filter(o => o.id !== org.id));
        });
      },
    });
  }

  closeDialog(): void {
    this.dialogVisible.set(false);
    this.form.get('slug')?.enable();
  }
}
