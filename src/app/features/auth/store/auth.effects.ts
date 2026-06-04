import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { catchError, map, switchMap, tap, exhaustMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthActions } from './auth.actions';
import { AuthService } from '../auth.service';
import { AuthTokenService } from '../../../core/services/auth-token.service';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          map((response) => AuthActions.loginSuccess({ response })),
          catchError((err) =>
            of(AuthActions.loginFailure({ error: err.error?.error ?? err.error?.message ?? 'Login muvaffaqiyatsiz' }))
          )
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ response }) => {
          this.tokenService.setToken(response.accessToken);
          this.tokenService.setRefreshToken(response.refreshToken);
          this.router.navigate(['/dashboard']);
        })
      ),
    { dispatch: false }
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ request }) =>
        this.authService.register(request).pipe(
          map((response) => AuthActions.registerSuccess({ response })),
          catchError((err) =>
            of(AuthActions.registerFailure({ error: err.error?.error ?? err.error?.message ?? "Ro'yxatdan o'tish muvaffaqiyatsiz" }))
          )
        )
      )
    )
  );

  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(({ response }) => {
          this.tokenService.setToken(response.accessToken);
          this.tokenService.setRefreshToken(response.refreshToken);
          this.router.navigate(['/dashboard']);
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        exhaustMap(() => {
          const refreshToken = this.tokenService.getRefreshToken() ?? '';
          return this.authService.logout(refreshToken).pipe(
            catchError(() => of(null))
          );
        }),
        tap(() => {
          this.tokenService.clearToken();
          this.router.navigate(['/auth/login']);
        })
      ),
    { dispatch: false }
  );

  constructor(
    private authService: AuthService,
    private tokenService: AuthTokenService,
    private router: Router
  ) {}
}
