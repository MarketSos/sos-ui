import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { catchError, of } from 'rxjs';
import { CoreApiService, MeasurementUnitDto } from '../../../core/services/core-api.service';

@Component({
  selector: 'app-measurement-units',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, ButtonModule, ToastModule, DialogModule, InputTextModule],
  providers: [MessageService],
  templateUrl: './measurement-units.component.html',
  styleUrls: ['./measurement-units.component.scss'],
})
export class MeasurementUnitsComponent implements OnInit {
  private svc   = inject(CoreApiService);
  private fb    = inject(FormBuilder);
  private toast = inject(MessageService);

  loading = signal(true);
  saving  = signal(false);

  measurementUnits = signal<MeasurementUnitDto[]>([]);

  dialogVisible = signal(false);

  form = this.fb.group({
    code:          ['', Validators.required],
    nameUz:        ['', Validators.required],
    nameRu:        ['', Validators.required],
    nameEn:        [''],
    isWeightBased: [false],
  });

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.svc.getMeasurementUnits().pipe(catchError(() => of([] as MeasurementUnitDto[]))).subscribe(data => {
      this.measurementUnits.set(data);
      this.loading.set(false);
    });
  }

  openCreate(): void {
    this.form.reset({ code: '', nameUz: '', nameRu: '', nameEn: '', isWeightBased: false });
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
      isWeightBased: boolean | null;
    };
    this.svc.createMeasurementUnit({
      code: data.code ?? '',
      nameUz: data.nameUz ?? '',
      nameRu: data.nameRu ?? '',
      nameEn: data.nameEn ?? undefined,
      isWeightBased: !!data.isWeightBased,
    }).pipe(catchError(err => {
      this.toast.add({ severity: 'error', summary: 'Xato', detail: err.error?.error ?? 'Xato' });
      this.saving.set(false);
      return of(null);
    })).subscribe(res => {
      if (res === null) return;
      this.toast.add({ severity: 'success', summary: 'Yaratildi', detail: data.nameUz ?? '' });
      this.saving.set(false);
      this.dialogVisible.set(false);
      this.load();
    });
  }
}
