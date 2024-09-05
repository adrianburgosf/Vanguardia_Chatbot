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

  email: string = '';
  password: string = '';
  loginError: string = '';  // To show error message if login fails

  constructor(private http: HttpClient, private router: Router) { }

  login() {
    let loginData = {
      "email": this.email,
      "password": this.password,
    };

    this.http.post('http://localhost:3000/user/login', loginData)
      .subscribe(
        (response: any) => {
          console.log('Login successful:', response);
          this.router.navigate(['/landing-page']);  // Navigate to the desired page after login
        },
        (error) => {
          console.error('Login error:', error);
          this.loginError = 'Invalid email or password';  // Show error message
        }
      );
  }
}

