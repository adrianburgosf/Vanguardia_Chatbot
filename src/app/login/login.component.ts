import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';  // Import FormsModule for ngModel
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf],  // Import FormsModule here
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginObj: any = {
    "email": "",
    "password": ""
  }

  loginError: string = '';  // To show error message if login fails

  constructor(private http: HttpClient, private router: Router) { }

  login() {
    this.http.post('http://localhost:3000/user/login', this.loginObj).subscribe(
      (res: any) => {
        if (res && res.token) {
          console.log('Login successful:', res);
          localStorage.setItem('loginToken', res.token);  // Store token
          this.router.navigate(['/landing-page']);  // Redirect to landing page
        }
      },
      (error) => {
        // Check if the error is related to no account found
        if (error.status === 404) {
          this.loginError = 'No account found with this email. Please sign up first.';
          this.loginObj = {
            email: '',
            password: ''
          };
        } else if (error.status === 401) {
          this.loginError = 'Invalid email or password.';
          this.loginObj = {
            password: ''
          };
        } else {
          this.loginError = 'An error occurred. Please try again later.';
          this.loginObj = {
            password: ''
          };
        }
      }
    );
  }
}

