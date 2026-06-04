import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthActions } from '../store/auth.actions';
import { selectAuthLoading, selectAuthError } from '../store/auth.selectors';
import { AuthTokenService } from '../../../core/services/auth-token.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private router = inject(Router);
  private tokenService = inject(AuthTokenService);

  form = this.fb.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );

  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);
  hidePassword = true;
  hideConfirm = true;

  ngOnInit(): void {
    if (this.tokenService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      const { username, email, password } = this.form.getRawValue();
      this.store.dispatch(
        AuthActions.register({ request: { username: username!, email: email!, password: password! } })
      );
    }
  }
}
