import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';  // Import FormsModule for ngModel

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],  // Import FormsModule here
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  profilePicture: File | null = null;

  constructor(private http: HttpClient) { }

  onFileSelected(event: any) {
    this.profilePicture = event.target.files[0];
  }

  register() {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    let userData = {
      "email": this.email,
      "password": this.password,
      "profilePicture": this.profilePicture,
    };
    this.http.post('http://localhost:3000/user/create', userData)
      .subscribe(response => {
        console.log('User registered:', response);
        alert("Registered");
      });
    console.log('User Data:', {
      email: this.email,
      password: this.password,
      profilePicture: this.profilePicture
    });

  }
}
