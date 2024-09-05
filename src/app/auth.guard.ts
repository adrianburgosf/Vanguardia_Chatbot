import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const isAuthenticated = this.authService.isAuthenticated();

    // Redirect authenticated users 
    if (isAuthenticated && (route.routeConfig?.path === 'login' || route.routeConfig?.path === 'register')) {
      this.router.navigate(['/landing-page']);
      return false;
    }

    // Redirect unauthenticated users 
    if (!isAuthenticated && route.routeConfig?.path === 'landing-page') {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}

