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

//Login Methods
export class LoginComponent implements OnInit {

  constructor(private http: HttpClient, private router: Router, private _ngZone: NgZone, private service: AuthService,) { }

  loginObj: any = {
    "email": "",
    "password": ""
  }
  loginError: string = '';

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
        this._ngZone.run(() => {
          console.log(res);
          if (res && res.tokenClient) {
            console.log('Login successful:', res);
            this.service.setUserData(res.user, res.tokenClient);
            //localStorage.setItem('loginToken', res.tokenClient);
            this.router.navigate(['/landing-page']);
          }
        });
      },
      (error) => {
        this._ngZone.run(() => { // Using NgZone to update the view
          if (error.status === 400) {
            this.loginError = 'An account already exists with this e-mail address. Please sign in using a different method or use a different email.'
            this.loginObj = {
              email: '',
              password: ''
            };
          }
          else {
            this.loginError = 'An error occurred. Please try again later.';
            this.loginObj = {
              email: this.loginObj.email,
              password: ''
            };
          }
        });
      }
    );
  }

  //Facebook Login
  async checkLoginState() {
    console.log("Checking login state...");
    this.clearLoginError();
    FB.login((response: any) => {
      if (response.status === 'connected') {
        // The user logged in successfully and authorized your app
        console.log(response.authResponse);
        this.handleLogin(response.authResponse.accessToken); // Proceed with login
      } else if (response.status === 'not_authorized') {
        // The user is logged into Facebook but has not authorized your app
        console.log('Logged into Facebook but not authorized the app');
        this.loginError = 'Please authorize the app to log in.';
      } else {
        // The user isn't logged into Facebook, or they closed the popup without logging in
        console.log('User not logged in or closed the popup:', response);
        this.loginError = 'Login cancelled or not authorized.';
      }
    }, { scope: 'email, public_profile', auth_type: 'reauthenticate' });

  }

  private handleLogin(accessToken: string) {
    this.service.LoginWithFacebook(accessToken).subscribe(
      (res: any) => {
        this._ngZone.run(() => {
          if (res && res.tokenClient) {
            console.log('Login successful:', res);
            this.service.setUserData(res.user, res.tokenClient);
            //localStorage.setItem('loginToken', res.tokenClient);
            this.router.navigate(['/landing-page']);
          }
        });
      },
      (error) => {
        this._ngZone.run(() => {
          if (error.status === 400) {
            this.loginErrorDuplicate();
            this.loginError = 'An account already exists with this e-mail address. Please sign in using a different method or use a different Facebook account.'
            this.loginObj = {
              email: '',
              password: ''
            };
          }
          else {
            this.loginError = 'An error occurred. Please try again later.';
            this.loginObj = {
              email: this.loginObj.email,
              password: ''
            };
          }
        });
      }
    );
  }

  //Normal Email Login
  login() {
    this.http.post('http://localhost:3000/user/login', this.loginObj).subscribe(
      (res: any) => {
        if (res && res.token) {
          console.log('Login successful:', res);
          this.service.setUserData(res.user, res.token);
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
        }
        else if (error.status === 403) {
          this.loginError = 'This email has already been used to sign in via Facebook. Please log in using Facebook.'
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

  clearLoginError(): void {
    this._ngZone.run(() => {
      this.loginError = '';
    });
  }

  loginErrorDuplicate(): void {
    this._ngZone.run(() => {
      this.loginError = 'An account already exists with this e-mail address. Please sign in using a different method or use a different Facebook account.'
    });
  }
}

