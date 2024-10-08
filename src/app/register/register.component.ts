declare var google: any;
declare var FB: any;
declare var enrollNewUser: any;

import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  email: string = '';
  password: string = '';
  name: string = '';
  confirmPassword: string = '';
  profilePicture: File | null = null;
  RegisterError: string = '';

  constructor(private http: HttpClient, private router: Router, private service: AuthService, private _ngZone: NgZone) { }

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

  //Add FaceID to Facebook and Google accounts
  updateFaceID(email: string, name: string,): void {
    enrollNewUser(email, name,
      (facialId: string) => {
        console.log(facialId);
        this.http.post('https://vanguardia-chatbot-backend.onrender.com/user/updateFacialId', { email, facialId })
          .subscribe(
            response => {
              console.log('FaceID enrollment successful:', response);
              this.router.navigate(['/landing-page']);
            },
            (error) => {
              console.log(error);
              this.router.navigate(['/landing-page']);
            }
          );
      },
      (errCode: any) => {
        console.log(errCode);
        this.router.navigate(['/landing-page']);
      }
    );
  }

  //Google Login
  handleCredentialResponse(response: any): void {
    const token = response.credential; // The JWT from Google

    // Send the Google token to the backend
    this.http.post('https://vanguardia-chatbot-backend.onrender.com/user/googleRegister', { token }).subscribe(
      (res: any) => {
        if (res && res.tokenClient) {
          console.log('Login successful:', res);
          if (res.NewUser) {
            this.service.setUserData(res.NewUser, res.tokenClient);
            this.updateFaceID(res.NewUser.email, res.NewUser.name);
          }
          else if (res.user) {
            this.service.setUserData(res.user, res.tokenClient);
            this.router.navigate(['/landing-page']);
          }
        }
      },
      (error) => {
        if (error.status === 400) {
          this.RegisterError = 'An account already exists with this e-mail address. Please sign in via normal login or use a different email.'
        }
      }
    );
  }

  //Facebook Login
  async checkLoginState() {
    console.log("Checking login state...");
    this.clearRegisterError();
    FB.login((response: any) => {
      if (response.status === 'connected') {
        // The user logged in successfully and authorized your app
        console.log('Logged in and authorized:', response.authResponse);
        this.handleLogin(response.authResponse.accessToken); // Proceed with login
      } else if (response.status === 'not_authorized') {
        // The user is logged into Facebook but has not authorized your app
        console.log(response.status);
        console.log('Logged into Facebook but not authorized the app');
        this.RegisterError = 'Please authorize the app to log in.';
      } else {
        // The user isn't logged into Facebook, or they closed the popup without logging in
        console.log(response.status);
        console.log('User not logged in or closed the popup:', response);
        this.RegisterError = 'Login cancelled or not authorized.';
      }
    }, { scope: 'email', auth_type: 'reauthenticate' });
  }

  private handleLogin(accessToken: string) {
    this.service.LoginWithFacebook(accessToken).subscribe(
      (res: any) => {
        this._ngZone.run(() => {
          if (res && res.tokenClient) {
            console.log('Login successful:', res);
            if (res.NewUser) {
              this.service.setUserData(res.NewUser, res.tokenClient);
              this.updateFaceID(res.NewUser.email, res.NewUser.name);
            }
            else if (res.user) {
              this.service.setUserData(res.user, res.tokenClient);
              this.router.navigate(['/landing-page']);
            }
          }
        });
      },
      (error) => {
        this._ngZone.run(() => {
          if (error.status === 400) {
            this.loginErrorDuplicate();
            this.RegisterError = 'An account already exists with this e-mail address. Please sign in using a different method or use a different Facebook account.'
            this.email = '';
            this.password = '';
            this.name = '';
            this.confirmPassword = '';

          }
          else {
            this.RegisterError = 'An error occurred. Please try again later.';
            this.email = '';
            this.password = '';
            this.name = '';
            this.confirmPassword = '';
          }
        });
      }
    );
  }

  onFileSelected(event: any) {
    this.profilePicture = event.target.files[0];
  }

  register() {
    if (!this.isValidEmail(this.email)) {
      this.RegisterError = 'Please enter a valid email address.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.RegisterError = 'Passwords do not match.';
      return;
    }
    if (!this.name) {
      this.RegisterError = 'Please enter a name.';
      return;
    }

    enrollNewUser(this.email, this.name,
      (facialId: string) => {
        console.log(facialId);
        let userData = {
          "email": this.email,
          "name": this.name,
          "password": this.password,
          "profilePicture": null,
          "facialId": facialId,
        };
        this.http.post('https://vanguardia-chatbot-backend.onrender.com/user/create', userData)
          .subscribe(
            response => {
              console.log('User registered:', response);
              this.router.navigate(['/login']);
            },
            (error) => {
              if (error.status === 400) {
                this.RegisterError = 'User already exists';
                this.name = '';
                this.password = '';
                this.confirmPassword = '';
              }
              else {
                this.RegisterError = 'An error occurred. Please try again later.';
                this.password = '';
                this.name = '';
                this.confirmPassword = '';
              }
            }
          );
      },
      (errCode: any) => {
        console.log(errCode);
        this.RegisterError = 'Facial enrollment failed. Please try again.';
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

  loginErrorDuplicate(): void {
    this._ngZone.run(() => {
      this.RegisterError = 'An account already exists with this e-mail address. Please sign in using a different method or use a different Facebook account.'
    });
  }
}
