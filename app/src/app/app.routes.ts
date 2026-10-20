import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './auth.guard';
export const routes: Routes = [
  { path: '', redirectTo: 'eventos', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login.page').then(m => m.LoginPage) },
  { path: 'eventos', canActivate: [authGuard], loadComponent: () => import('./pages/eventos.page').then(m => m.EventosPage) },
  { path: 'evento/:id', canActivate: [authGuard], loadComponent: () => import('./pages/detalle.page').then(m => m.DetallePage) },
  { path: 'admin/nuevo', canActivate: [authGuard, adminGuard], loadComponent: () => import('./pages/form.page').then(m => m.FormPage) },
  { path: 'admin/editar/:id', canActivate: [authGuard, adminGuard], loadComponent: () => import('./pages/form.page').then(m => m.FormPage) }
];
