import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PasswordModule } from 'primeng/password';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService, ConfirmationService } from 'primeng/api';
import { catchError, forkJoin, of } from 'rxjs';
import { CoreApiService, UserDto, RoleSummaryDto } from '../../../core/services/core-api.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    TableModule, ButtonModule, TagModule, ToastModule,
    DialogModule, InputTextModule, SelectModule, PasswordModule,
    ConfirmDialogModule, IconFieldModule, InputIconModule, TranslatePipe,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  private svc     = inject(CoreApiService);
  private fb      = inject(FormBuilder);
  private toast   = inject(MessageService);
  private confirm = inject(ConfirmationService);

  users       = signal<UserDto[]>([]);
  roles       = signal<RoleSummaryDto[]>([]);
  loading     = signal(true);
  saving      = signal(false);
  searchQuery = '';

  createDialogVisible    = signal(false);
  roleDialogVisible      = signal(false);
  passwordDialogVisible  = signal(false);
  selectedUser           = signal<UserDto | null>(null);

  createForm = this.fb.group({
    userName: ['', [Validators.required, Validators.minLength(3)]],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    roleId:   ['', Validators.required],
  });

  roleForm = this.fb.group({
    roleId: ['', Validators.required],
  });

  passwordForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  get filteredUsers(): UserDto[] {
    if (!this.searchQuery.trim()) return this.users();
    const q = this.searchQuery.toLowerCase();
    return this.users().filter(u =>
      u.userName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    forkJoin({
      users: this.svc.getUsers().pipe(catchError(() => of([]))),
      roles: this.svc.getRoles().pipe(catchError(() => of([]))),
    }).subscribe(({ users, roles }) => {
      this.users.set(users);
      this.roles.set(roles);
      this.loading.set(false);
    });
  }

  openCreate(): void {
    this.createForm.reset();
    this.createDialogVisible.set(true);
  }

  createUser(): void {
    if (this.createForm.invalid) return;
    this.saving.set(true);
    const v = this.createForm.getRawValue();
    this.svc.createUser({ userName: v.userName!, email: v.email!, password: v.password!, roleIds: [v.roleId!] })
      .pipe(catchError(err => {
        this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Xato' });
        this.saving.set(false);
        return of(null);
      })).subscribe(res => {
        if (!res) return;
        this.saving.set(false);
        this.toast.add({ severity: 'success', summary: 'Yaratildi', detail: v.userName! });
        this.createDialogVisible.set(false);
        this.load();
      });
  }

  openChangeRole(user: UserDto): void {
    this.selectedUser.set(user);
    const current = this.roles().find(r => user.roles.includes(r.name));
    this.roleForm.patchValue({ roleId: current?.id ?? '' });
    this.roleDialogVisible.set(true);
  }

  saveRole(): void {
    if (!this.selectedUser()) return;
    this.saving.set(true);
    this.svc.changeRole(this.selectedUser()!.id, [this.roleForm.getRawValue().roleId!])
      .pipe(catchError(err => {
        this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Xato' });
        this.saving.set(false);
        return of(undefined);
      })).subscribe(() => {
        this.saving.set(false);
        this.toast.add({ severity: 'success', summary: 'Rol o\'zgartirildi', detail: this.selectedUser()!.userName });
        this.roleDialogVisible.set(false);
        this.load();
      });
  }

  openResetPassword(user: UserDto): void {
    this.selectedUser.set(user);
    this.passwordForm.reset();
    this.passwordDialogVisible.set(true);
  }

  resetPassword(): void {
    if (this.passwordForm.invalid || !this.selectedUser()) return;
    this.saving.set(true);
    this.svc.resetPassword(this.selectedUser()!.id, this.passwordForm.getRawValue().newPassword!)
      .pipe(catchError(err => {
        this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Xato' });
        this.saving.set(false);
        return of(undefined);
      })).subscribe(() => {
        this.saving.set(false);
        this.toast.add({ severity: 'success', summary: 'Parol yangilandi', detail: this.selectedUser()!.userName });
        this.passwordDialogVisible.set(false);
      });
  }

  toggleStatus(user: UserDto): void {
    const req$: Observable<void> = user.isActive
      ? this.svc.deactivateUser(user.id)
      : this.svc.activateUser(user.id);

    req$.pipe(catchError(err => {
      this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Xato' });
      return of(undefined);
    })).subscribe(() => {
      this.users.update(list => list.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
    });
  }

  roleLabel(roles: string[]): string {
    return roles.join(', ') || '—';
  }
}
