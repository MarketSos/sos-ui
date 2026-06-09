import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { AuthState } from './auth.model';

export const initialAuthState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.login, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    user: response.user,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(AuthActions.logout, () => initialAuthState),

  on(AuthActions.loadCurrentUser, (state) => ({ ...state, loading: true })),
  on(AuthActions.loadCurrentUserSuccess, (state, { user }) => ({
    ...state,
    loading: false,
    user,
  })),
  on(AuthActions.loadCurrentUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(AuthActions.register, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.registerSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    user: response.user,
  })),
  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);
