import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Store as NgRxStore } from '@ngrx/store';
import { catchError, of, switchMap, take } from 'rxjs';
import { StoresService } from './stores.service';
import { OrganizationsService } from '../../organizations/organizations.service';
import { Store } from './stores.models';
import { selectCurrentUser } from '../../auth/store/auth.selectors';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { LocaleService } from '../../../core/i18n/locale.service';

@Component({
  selector: 'app-stores',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    TableModule, ButtonModule, DialogModule,
    InputTextModule, IconFieldModule, InputIconModule, TagModule, ToastModule,
    ConfirmDialogModule, TooltipModule, TranslatePipe,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.scss'],
})
export class StoresComponent implements OnInit {
  private svc       = inject(StoresService);
  private orgSvc    = inject(OrganizationsService);
  private ngrx      = inject(NgRxStore);
  private fb        = inject(FormBuilder);
  locale            = inject(LocaleService);
  private confirm   = inject(ConfirmationService);
  private toast     = inject(MessageService);

  stores        = signal<Store[]>([]);
  loading       = signal(true);
  saving        = signal(false);
  dialogVisible = signal(false);
  editingId     = signal<string | null>(null);

  private organizationId = '';

  form = this.fb.group({
    code:    ['', [Validators.required, Validators.minLength(2)]],
    name:    ['', [Validators.required, Validators.minLength(2)]],
    address: [''],
    phone:   [''],
  });

  ngOnInit(): void {
    this.ngrx.select(selectCurrentUser).pipe(
      take(1),
      switchMap(() => this.orgSvc.getMine()),
      catchError(() => of(null)),
    ).subscribe(org => {
      if (org) {
        this.organizationId = org.id;
        this.load();
      } else {
        this.loading.set(false);
        this.toast.add({ severity: 'warn', summary: 'Diqqat', detail: 'Tashkilot topilmadi' });
      }
    });
  }

  load(): void {
    this.loading.set(true);
    this.svc.getByOrganization(this.organizationId)
      .pipe(catchError(() => of([])))
      .subscribe(data => {
        this.stores.set(data);
        this.loading.set(false);
      });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset();
    this.dialogVisible.set(true);
  }

  openEdit(store: Store): void {
    this.editingId.set(store.id);
    this.form.patchValue({
      code:    store.code,
      name:    store.name,
      address: store.address ?? '',
      phone:   store.phone ?? '',
    });
    this.dialogVisible.set(true);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v     = this.form.getRawValue();
    const id    = this.editingId();
    const label = id ? 'Yangilandi' : 'Yaratildi';

    const done = () => {
      this.saving.set(false);
      this.toast.add({ severity: 'success', summary: 'Muvaffaqiyatli', detail: label });
      this.dialogVisible.set(false);
      this.load();
    };

    const fail = (err: any) => {
      this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Saqlashda xato' });
      this.saving.set(false);
    };

    const body = {
      code:    v.code!,
      name:    v.name!,
      address: v.address || undefined,
      phone:   v.phone || undefined,
    };

    if (id) {
      this.svc.update(id, body).subscribe({ next: done, error: fail });
    } else {
      this.svc.create({ organizationId: this.organizationId, ...body }).subscribe({ next: done, error: fail });
    }
  }

  toggleStatus(store: Store): void {
    const req$ = store.isActive ? this.svc.deactivate(store.id) : this.svc.activate(store.id);
    req$.pipe(catchError(err => {
      this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Xato' });
      return of(undefined);
    })).subscribe(() => {
      this.stores.update(list =>
        list.map(s => s.id === store.id ? { ...s, isActive: !s.isActive } : s)
      );
    });
  }

  confirmDelete(store: Store): void {
    this.confirm.confirm({
      message:                `"${store.name}" do'konini o'chirishni tasdiqlaysizmi?`,
      header:                 "O'chirish",
      icon:                   'pi pi-exclamation-triangle',
      acceptLabel:            "O'chirish",
      rejectLabel:            'Bekor qilish',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.svc.delete(store.id).pipe(
          catchError(err => {
            this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Xato' });
            return of(undefined);
          })
        ).subscribe(() => {
          this.toast.add({ severity: 'success', summary: "O'chirildi", detail: store.name });
          this.stores.update(list => list.filter(s => s.id !== store.id));
        });
      },
    });
  }

  get dialogTitle(): string {
    const key = this.editingId() ? 'btn_edit' : 'page_stores_add';
    return this.locale.translate(key);
  }
}
