declare var google: any;
import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';  // Import FormsModule for ngModel
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, NgIf],  // Import FormsModule here
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  profilePicture: File | null = null;
  RegisterError: string = '';

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined' && typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '556072889645-crfml8nhdb89lvitidhvaqad8v2oe3o6.apps.googleusercontent.com',
        callback: (response: any) => this.handleCredentialResponse(response)
      });

      google.accounts.id.renderButton(
        document.getElementById("google-btn"),
        { theme: 'filled_blue', size: 'large', width: "340", height: "43", shape: "rectangular" }
      );
    }
    else {
      console.log('Google API not available');
    }
  }

  //Google Login
  handleCredentialResponse(response: any): void {
    const token = response.credential; // The JWT from Google

    // Send the Google token to the backend
    this.http.post('http://localhost:3000/user/googleRegister', { token }).subscribe(
      (res: any) => {
        console.log(res);
        if (res && res.tokenClient) {
          console.log('Login successful:', res);
          localStorage.setItem('loginToken', res.tokenClient);
          this.router.navigate(['/landing-page']);
        }
      },
      (error) => {
        if (error.status === 400) {
          this.RegisterError = 'An account already exists with this e-mail address. Please sign in via normal login or use a different email.'
        }
      }
    );
  }

  onFileSelected(event: any) {
    this.profilePicture = event.target.files[0];
  }

  register() {
    if (!this.isValidEmail(this.email)) {
      this.RegisterError = 'Please enter a valid email address';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.RegisterError = 'Passwords do not match';
      return;
    }

    let userData = {
      "email": this.email,
      "password": this.password,
      "profilePicture": this.profilePicture,
    };
    this.http.post('http://localhost:3000/user/create', userData)
      .subscribe(
        response => {
          console.log('User registered:', response);
          alert("Registered");
        },
        (error) => {
          if (error.status === 400) {
            this.RegisterError = 'User already exists';
            this.password = '';
            this.confirmPassword = '';
          }
          else {
            this.RegisterError = 'An error occurred. Please try again later.';
            this.password = '';
            this.confirmPassword = '';
          }
        }
      );
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  clearRegisterError() {
    this.RegisterError = '';  // Clear the login error messages
  }
}
