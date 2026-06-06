import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { AuthActions } from '../auth/store/auth.actions';
import { selectCurrentUser } from '../auth/store/auth.selectors';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="topbar">
      <span class="brand">SOS</span>
      <div class="topbar-right">
        <span class="username">{{ (user$ | async)?.username }}</span>
        <p-button
          icon="pi pi-sign-out"
          [rounded]="true"
          [text]="true"
          severity="secondary"
          (onClick)="logout()"
          title="Chiqish"
        />
      </div>
    </div>
    <div class="page-content">
      <h2>Dashboard</h2>
      <p>Xush kelibsiz, <strong>{{ (user$ | async)?.username }}</strong>!</p>
    </div>
  `,
  styles: [`
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      height: 56px;
      background: #667eea;
      color: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,.15);
    }
    .brand { font-size: 1.25rem; font-weight: 700; letter-spacing: 1px; }
    .topbar-right { display: flex; align-items: center; gap: 0.75rem; }
    .username { font-size: 0.9rem; opacity: .9; }
    .page-content { padding: 2rem; }
  `],
})
export class DashboardComponent {
  private store = inject(Store);
  user$ = this.store.select(selectCurrentUser);

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
