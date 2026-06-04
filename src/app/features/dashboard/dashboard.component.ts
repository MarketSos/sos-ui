import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { AuthActions } from '../auth/store/auth.actions';
import { selectCurrentUser } from '../auth/store/auth.selectors';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary">
      <span>SOS - Store Operation System</span>
      <span class="spacer"></span>
      <span>{{ (user$ | async)?.username }}</span>
      <button mat-icon-button (click)="logout()" title="Chiqish">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>
    <div style="padding: 24px">
      <h2>Dashboard</h2>
      <p>Xush kelibsiz, {{ (user$ | async)?.username }}!</p>
    </div>
  `,
  styles: [`.spacer { flex: 1 1 auto; }`],
})
export class DashboardComponent {
  private store = inject(Store);

  user$ = this.store.select(selectCurrentUser);

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
