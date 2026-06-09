import { ApplicationConfig, APP_INITIALIZER, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore, Store } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { authReducer } from './features/auth/store/auth.reducer';
import { AuthEffects } from './features/auth/store/auth.effects';
import { AuthTokenService } from './core/services/auth-token.service';
import { AuthActions } from './features/auth/store/auth.actions';
import { environment } from '../environments/environment';

function restoreUserFactory(store: Store, tokenService: AuthTokenService) {
  return () => {
    if (!tokenService.isLoggedIn()) return;
    const user = tokenService.getUser();
    if (user) store.dispatch(AuthActions.loadCurrentUserSuccess({ user }));
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: { darkModeSelector: '.dark-mode' },
      },
      ripple: true,
    }),
    provideStore({ auth: authReducer }),
    provideEffects([AuthEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: environment.production }),
    {
      provide: APP_INITIALIZER,
      useFactory: restoreUserFactory,
      deps: [Store, AuthTokenService],
      multi: true,
    },
  ],
};
