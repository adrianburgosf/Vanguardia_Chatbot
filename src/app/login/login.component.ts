declare var google: any;
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';  // Import FormsModule for ngModel
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf, CommonModule],  // Import FormsModule here
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  ngOnInit(): void {
    if (typeof window !== 'undefined' && typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '556072889645-crfml8nhdb89lvitidhvaqad8v2oe3o6.apps.googleusercontent.com',
        callback: (resp: any) => {

        }
      });
      google.accounts.id.renderButton(document.getElementById("google-btn"), {
        theme: 'filled_blue',
        size: 'large',
        shape: 'rectangle',
        width: 340,
      });
    } else {
      console.log('Google API not available');
    }
  }

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

