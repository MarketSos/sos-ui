import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { LoginRequest, LoginResponse, RegisterRequest, User } from './auth.model';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login': props<{ credentials: LoginRequest }>(),
    'Login Success': props<{ response: LoginResponse }>(),
    'Login Failure': props<{ error: string }>(),
    'Logout': emptyProps(),
    'Load Current User': emptyProps(),
    'Load Current User Success': props<{ user: User }>(),
    'Load Current User Failure': props<{ error: string }>(),
    'Register': props<{ request: RegisterRequest }>(),
    'Register Success': props<{ response: LoginResponse }>(),
    'Register Failure': props<{ error: string }>(),
  },
});
