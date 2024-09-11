import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router, private http: HttpClient) { }

  LoginWithFacebook(token: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const body = JSON.stringify({ token }); // Ensure it's an object
    return this.http.post('http://localhost:3000/user/facebookRegister', body, { headers });
  }

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

