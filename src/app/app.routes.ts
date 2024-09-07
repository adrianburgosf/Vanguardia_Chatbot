import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },  // Protected by the same guard
    { path: 'register', component: RegisterComponent, canActivate: [AuthGuard] },  // Protected by the same guard
    { path: 'landing-page', component: LandingPageComponent, canActivate: [AuthGuard] },  // Protected by the same guard
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/register' }
];

