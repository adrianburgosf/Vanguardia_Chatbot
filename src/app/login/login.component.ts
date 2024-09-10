declare var google: any;
declare var FB: any;
import { Component, OnInit, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
//hola

//Login Methods
export class LoginComponent implements OnInit {

  constructor(private http: HttpClient, private router: Router, private _ngZone: NgZone, private service: AuthService,) { }

  //Google Login
  ngOnInit(): void {

    if (typeof window !== 'undefined' && typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '556072889645-crfml8nhdb89lvitidhvaqad8v2oe3o6.apps.googleusercontent.com',
        callback: (response: any) => this.handleCredentialResponse(response)
      });

      google.accounts.id.renderButton(
        document.getElementById("google-btn"),
        { theme: 'filled_black', size: 'large', width: "340", height: "45", shape: "rectangular" }
      );
    }
    else {
      console.log('Google API not available');
    }
  }

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
          this.loginError = 'An account already exists with this e-mail address. Please sign in via normal login or use a different email.'
          this.loginObj = {
            email: '',
            password: ''
          };
        }
      }
    );
  }

  //Facebook Login
  async checkLoginState() {
    console.log("Hola1");
    FB.login(async (result: any) => {
      console.log("Hola");
      await this.service.LoginWithFacebook(result.authResponse.accessToken).subscribe(
        (x: any) => {
          this._ngZone.run(() => {
            this.router.navigate(['/landing-page'])
          })
        },
        (error: any) => {
          console.log(error);
        }
      );
    }, { scope: 'email' });
  }

  //Normal Email Login
  loginObj: any = {
    "email": "",
    "password": ""
  }
  loginError: string = '';

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
            email: this.loginObj.email,
            password: ''
          };
        } else if (error.status === 400) {
          this.loginError = 'This email has already been used to sign in via Google. Please log in using Google.';
          this.loginObj = {
            email: this.loginObj.email,
            password: ''
          };
        } else {
          this.loginError = 'An error occurred. Please try again later.';
          this.loginObj = {
            email: this.loginObj.email,
            password: ''
          };
        }
      }
    );
  }

  clearLoginError() {
    this.loginError = '';
  }
}

