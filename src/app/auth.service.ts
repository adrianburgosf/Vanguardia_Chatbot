import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) { }

  // Check if running in a browser environment
  isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  // Check if a user is authenticated
  isAuthenticated(): boolean {
    if (!this.isBrowser()) {
      return false;
    }
    const token = localStorage.getItem('loginToken');
    return !!token; // Returns true if a token exists
  }

  // Logout function to clear token and redirect to login page
  logout() {
    if (this.isBrowser()) {
      localStorage.removeItem('loginToken');
    }
    this.router.navigate(['/login']);
  }
}

