import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from './services/api.service';
export const authGuard: CanActivateFn = () => { const a = inject(ApiService); return a.token ? true : inject(Router).createUrlTree(['/login']); };
export const adminGuard: CanActivateFn = () => { const a = inject(ApiService); return a.esAdmin ? true : inject(Router).createUrlTree(['/eventos']); };
