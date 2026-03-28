import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ApiTestComponent } from './pages/api-test/api-test.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: HomeComponent }, // Keycloak will handle redirect
  { path: 'register', component: HomeComponent }, // Keycloak will handle redirect
  { path: 'api-test', component: ApiTestComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];