import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { catchError, of } from 'rxjs';
import { CoreApiService, CategoryDto } from '../../../core/services/core-api.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { EntityNamePipe } from '../../../core/i18n/entity-name.pipe';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, ToastModule, TranslatePipe, EntityNamePipe],
  providers: [MessageService],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit {
  private svc = inject(CoreApiService);

  loading    = signal(true);
  categories = signal<CategoryDto[]>([]);

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.svc.getCategories().pipe(catchError(() => of([] as CategoryDto[]))).subscribe(data => {
      this.categories.set(data);
      this.loading.set(false);
    });
  }
}
