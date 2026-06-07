import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService, ConfirmationService } from 'primeng/api';
import { catchError, forkJoin, of } from 'rxjs';
import { CoreApiService, EmployeeSummaryDto, EmployeeDto, UserDto } from '../../core/services/core-api.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    TableModule, ButtonModule, TagModule, ToastModule,
    DialogModule, InputTextModule, SelectModule,
    ConfirmDialogModule, IconFieldModule, InputIconModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss'],
})
export class EmployeesComponent implements OnInit {
  private svc     = inject(CoreApiService);
  private fb      = inject(FormBuilder);
  private toast   = inject(MessageService);
  private confirm = inject(ConfirmationService);

  employees   = signal<EmployeeSummaryDto[]>([]);
  users       = signal<UserDto[]>([]);
  loading     = signal(true);
  saving      = signal(false);
  searchQuery = '';

  createDialogVisible = signal(false);
  detailDialogVisible = signal(false);
  hireDialogVisible   = signal(false);
  fireDialogVisible   = signal(false);
  selectedEmployee    = signal<EmployeeDto | null>(null);

  createForm = this.fb.group({
    userId:    ['', Validators.required],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName:  ['', [Validators.required, Validators.minLength(2)]],
    phone:     [''],
    hireDate:  [''],
  });

  hireForm = this.fb.group({ hireDate: ['', Validators.required] });
  fireForm = this.fb.group({ fireDate: ['', Validators.required] });

  get filteredEmployees(): EmployeeSummaryDto[] {
    if (!this.searchQuery.trim()) return this.employees();
    const q = this.searchQuery.toLowerCase();
    return this.employees().filter(e =>
      e.fullName.toLowerCase().includes(q) ||
      (e.phone ?? '').toLowerCase().includes(q)
    );
  }

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    forkJoin({
      employees: this.svc.getEmployees().pipe(catchError(() => of([]))),
      users:     this.svc.getUsers().pipe(catchError(() => of([]))),
    }).subscribe(({ employees, users }) => {
      this.employees.set(employees);
      this.users.set(users);
      this.loading.set(false);
    });
  }

  openCreate(): void {
    this.createForm.reset();
    this.createDialogVisible.set(true);
  }

  createEmployee(): void {
    if (this.createForm.invalid) return;
    this.saving.set(true);
    const v = this.createForm.getRawValue();
    this.svc.createEmployee({
      userId:    v.userId!,
      firstName: v.firstName!,
      lastName:  v.lastName!,
      phone:     v.phone || undefined,
      hireDate:  v.hireDate || undefined,
    }).pipe(catchError(err => {
      this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Xato' });
      this.saving.set(false);
      return of(null);
    })).subscribe(res => {
      if (!res) return;
      this.saving.set(false);
      this.toast.add({ severity: 'success', summary: 'Yaratildi', detail: v.firstName + ' ' + v.lastName });
      this.createDialogVisible.set(false);
      this.load();
    });
  }

  openDetail(emp: EmployeeSummaryDto): void {
    this.detailDialogVisible.set(true);
    this.svc.getEmployee(emp.id).pipe(catchError(() => of(null))).subscribe(detail => {
      this.selectedEmployee.set(detail);
    });
  }

  openHire(emp: EmployeeSummaryDto): void {
    this.svc.getEmployee(emp.id).pipe(catchError(() => of(null))).subscribe(detail => {
      this.selectedEmployee.set(detail);
      this.hireForm.reset({ hireDate: new Date().toISOString().split('T')[0] });
      this.hireDialogVisible.set(true);
    });
  }

  hireEmployee(): void {
    if (this.hireForm.invalid || !this.selectedEmployee()) return;
    this.saving.set(true);
    this.svc.hireEmployee(this.selectedEmployee()!.id, this.hireForm.getRawValue().hireDate!)
      .pipe(catchError(err => {
        this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Xato' });
        this.saving.set(false);
        return of(undefined);
      })).subscribe(() => {
        this.saving.set(false);
        this.toast.add({ severity: 'success', summary: 'Ishga qabul qilindi' });
        this.hireDialogVisible.set(false);
        this.load();
      });
  }

  openFire(emp: EmployeeSummaryDto): void {
    this.svc.getEmployee(emp.id).pipe(catchError(() => of(null))).subscribe(detail => {
      this.selectedEmployee.set(detail);
      this.fireForm.reset({ fireDate: new Date().toISOString().split('T')[0] });
      this.fireDialogVisible.set(true);
    });
  }

  fireEmployee(): void {
    if (this.fireForm.invalid || !this.selectedEmployee()) return;
    this.saving.set(true);
    this.svc.fireEmployee(this.selectedEmployee()!.id, this.fireForm.getRawValue().fireDate!)
      .pipe(catchError(err => {
        this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Xato' });
        this.saving.set(false);
        return of(undefined);
      })).subscribe(() => {
        this.saving.set(false);
        this.toast.add({ severity: 'warn', summary: 'Ishdan bo\'shatildi' });
        this.fireDialogVisible.set(false);
        this.load();
      });
  }

  confirmDelete(emp: EmployeeSummaryDto): void {
    this.confirm.confirm({
      message: `"${emp.fullName}" ni o'chirishni tasdiqlaysizmi?`,
      header: "O'chirish", icon: 'pi pi-exclamation-triangle',
      acceptLabel: "O'chirish", rejectLabel: 'Bekor',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.svc.deleteEmployee(emp.id).pipe(catchError(err => {
          this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Xato' });
          return of(undefined);
        })).subscribe(() => {
          this.toast.add({ severity: 'success', summary: "O'chirildi", detail: emp.fullName });
          this.employees.update(list => list.filter(e => e.id !== emp.id));
        });
      },
    });
  }

  get availableUsers(): UserDto[] {
    const empUserIds = new Set(this.employees().map(e => e.userId));
    return this.users().filter(u => !empUserIds.has(u.id));
  }
}
