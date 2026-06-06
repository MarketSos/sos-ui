import { Component } from '@angular/core';

@Component({
  selector: 'app-employeescomponent',
  standalone: true,
  template: `
    <div class="page-header">
      <h1>Xodimlar</h1>
      <p>Bu sahifa ishlanmoqda...</p>
    </div>
  `,
  styles: [`
    .page-header h1 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-bottom: 0.25rem; }
    .page-header p  { color: #64748b; }
  `],
})
export class EmployeesComponent {}
