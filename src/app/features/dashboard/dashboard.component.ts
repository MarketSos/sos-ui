import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { AnalyticsService } from '../analytics/analytics.service';
import { SalesSummary } from '../analytics/analytics.models';
import { selectCurrentUser } from '../auth/store/auth.selectors';

interface Period { label: string; value: string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ChartModule,
    SelectButtonModule,
    SkeletonModule,
    ButtonModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private store = inject(Store);

  user$ = this.store.select(selectCurrentUser);

  periods: Period[] = [
    { label: 'Bugun', value: 'today' },
    { label: 'Bu hafta', value: 'week' },
    { label: 'Bu oy', value: 'month' },
  ];

  selectedPeriod = signal<string>('today');
  loading = signal(true);
  summary = signal<SalesSummary | null>(null);
  chartData = signal<any>(null);
  chartOptions = signal<any>(null);

  ngOnInit(): void {
    this.initChartOptions();
    this.load();
  }

  onPeriodChange(value: string): void {
    this.selectedPeriod.set(value);
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    const { from, to } = this.getRange(this.selectedPeriod());

    // Demo storeId — real loyihada auth dan olinadi
    const storeId = '00000000-0000-0000-0000-000000000001';

    this.analyticsService.getSalesSummary(storeId, from, to).pipe(
      catchError(() => of(null))
    ).subscribe(data => {
      this.summary.set(data);
      this.buildChartData(data);
      this.loading.set(false);
    });
  }

  private getRange(period: string): { from: Date; to: Date } {
    const to = new Date();
    const from = new Date();
    if (period === 'week') from.setDate(from.getDate() - 7);
    else if (period === 'month') from.setDate(1);
    else { from.setHours(0, 0, 0, 0); to.setHours(23, 59, 59, 999); }
    return { from, to };
  }

  private buildChartData(summary: SalesSummary | null): void {
    if (!summary) { this.chartData.set(null); return; }

    this.chartData.set({
      labels: ['Daromad (ming)', 'Sotuvlar', 'O\'rtacha chek (ming)'],
      datasets: [{
        data: [
          +(summary.totalRevenue / 1000).toFixed(1),
          summary.totalSales,
          +(summary.averageOrderValue / 1000).toFixed(1),
        ],
        backgroundColor: ['#667eea', '#22c55e', '#f59e0b'],
        borderRadius: 6,
      }],
    });
  }

  private initChartOptions(): void {
    this.chartOptions.set({
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
        x: { grid: { display: false } },
      },
      responsive: true,
      maintainAspectRatio: false,
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('uz-UZ').format(value) + ' so\'m';
  }
}
