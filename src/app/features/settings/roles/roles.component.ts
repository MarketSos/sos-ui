import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { catchError, of } from 'rxjs';
import { CoreApiService, RoleSummaryDto, RoleDto } from '../../../core/services/core-api.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, ToastModule, DialogModule],
  providers: [MessageService],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {
  private svc   = inject(CoreApiService);
  private toast = inject(MessageService);

  roles         = signal<RoleSummaryDto[]>([]);
  selectedRole  = signal<RoleDto | null>(null);
  loading       = signal(true);
  detailVisible = signal(false);
  detailLoading = signal(false);

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.svc.getRoles().pipe(catchError(() => of([]))).subscribe(data => {
      this.roles.set(data);
      this.loading.set(false);
    });
  }

  openDetail(role: RoleSummaryDto): void {
    this.detailLoading.set(true);
    this.detailVisible.set(true);
    this.svc.getRoleByName(role.name).pipe(
      catchError(() => of(null))
    ).subscribe(detail => {
      this.selectedRole.set(detail);
      this.detailLoading.set(false);
    });
  }
}
