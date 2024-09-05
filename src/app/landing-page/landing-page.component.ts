import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {
  constructor(private authService: AuthService) { }

  // Call logout method from AuthService
  logout() {
    this.authService.logout();
  }
}
