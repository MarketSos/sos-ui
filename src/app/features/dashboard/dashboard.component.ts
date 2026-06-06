import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1>Dashboard</h1>
      <p>Xush kelibsiz! Tizim umumiy ko'rinishi.</p>
    </div>
  `,
  styles: [`
    .page-header h1 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-bottom: 0.25rem; }
    .page-header p  { color: #64748b; font-size: 0.9rem; }
  `],
})
export class DashboardComponent {}
