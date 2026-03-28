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
import { UserListComponent } from './components/admin/user-list/user-list.component';
import { PreferencesFormComponent } from './components/professor/preferences-form/preferences-form.component';
import { SubjectManagementComponent } from './components/admin/subject-management/subject-management.component';
import { AdminProfessorPreferencesComponent } from './components/admin/professor-preferences/admin-professor-preferences.component';
import { ScheduleGeneratorComponent } from './components/admin/schedule-generator/schedule-generator.component';
import { SubmissionPeriodsComponent } from './components/admin/submission-periods/submission-periods.component';
import { RoleSelectorComponent } from './components/role-selector/role-selector.component';
import { UnifiedProfileComponent } from './components/profile/unified-profile/unified-profile.component';



export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginRedirectComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'pending', component: PendingComponent },
  { path: 'debug', component: KeycloakDebugComponent },
  { path: 'role-selector', component: RoleSelectorComponent, canActivate: [AuthGuard] },
  
  // PROFIL UNIFIÉ - une seule route pour tous !
  { 
    path: 'profile', 
    component: UnifiedProfileComponent,
    canActivate: [AuthGuard]
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
    path: 'admin/subjects', 
    component: SubjectManagementComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'admin/professor-preferences', 
    component: AdminProfessorPreferencesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'admin/schedule-generator', 
    component: ScheduleGeneratorComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'admin/submission-periods', 
    component: SubmissionPeriodsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] }
  },

  // Routes Professeurs

  { 
    path: 'professor/preferences', 
    component: PreferencesFormComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PROFESSOR'] }
  },




  
  { path: 'unauthorized', component: HomeComponent },
  { path: '**', redirectTo: '' }

];