// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminImportComponent } from './components/admin/admin-import/admin-import.component';
import { AdminValidationComponent } from './components/admin/admin-validation/admin-validation.component';
import { UserDashboardComponent } from './components/user/user-dashboard/user-dashboard.component';
import { LoginRedirectComponent } from './components/login/login-redirect.component';
import { KeycloakDebugComponent } from './components/debug/keycloak-debug.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { PendingComponent } from './components/auth/pending/pending.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { UserListComponent } from './components/admin/user-list/user-list.component';
import { UserProfileAdminComponent } from './components/admin/user-profile-admin/user-profile-admin.component';
import { PreferencesFormComponent } from './components/professor/preferences-form/preferences-form.component';
import { SubjectManagementComponent } from './components/admin/subject-management/subject-management.component';
import { SmartProfileComponent } from './components/profile/smart/smart-profile.component';
import { StandardProfileComponent } from './components/profile/standard/standard-profile.component';
import { ProfessorProfileComponent } from './components/profile/professor/professor-profile.component';



export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginRedirectComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'pending', component: PendingComponent },
  { path: 'debug', component: KeycloakDebugComponent },
  
  

  {
    path: 'profile',
    component: SmartProfileComponent,
    canActivate: [AuthGuard],
    data: { debug: true }
  },
  {
    path: 'profile/standard',
    component: StandardProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'professor/profile',
    component: ProfessorProfileComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['PROFESSOR'] }
  },
  
  { 
    path: 'dashboard', 
    component: UserDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['STUDENT', 'PROFESSOR'] }
  },
  { 
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'admin/import', 
    component: AdminImportComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'admin/validation', 
    component: AdminValidationComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'admin/users', 
    component: UserListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] }
  },
  
  { 
    path: 'admin/users/:id', 
    component: UserProfileAdminComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] }
  },

  { 
    path: 'admin/subjects', 
    component: SubjectManagementComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] }
  },

  { 
    path: 'professor/preferences', 
    component: PreferencesFormComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PROFESSOR'] }
  },




  
  { path: 'unauthorized', component: HomeComponent },
  { path: '**', redirectTo: '' }

];