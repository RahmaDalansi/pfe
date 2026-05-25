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
import { ClassroomManagementComponent } from './components/admin/classroom-management/classroom-management.component';
import { DepartmentManagementComponent } from './components/admin/department-management/department-management.component';
import { SpecialtyManagementComponent } from './components/admin/specialty-management/specialty-management.component';
import { LevelManagementComponent } from './components/admin/level-management/level-management.component';
import { GroupManagementComponent } from './components/admin/group-management/group-management.component';



// NOUVEAUX IMPORTS
import { PeriodManagementComponent } from './components/admin/period-management/period-management.component';
import { SubmissionStatisticsComponent } from './components/admin/submission-statistics/submission-statistics.component';
import { ExceptionPeriodComponent } from './components/admin/exception-period/exception-period.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginRedirectComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'pending', component: PendingComponent },
  { path: 'debug', component: KeycloakDebugComponent },
  
  // Routes de profil
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
  
  // Routes utilisateur
  { 
    path: 'dashboard', 
    component: UserDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['STUDENT', 'PROFESSOR'] }
  },
  
  // Routes administrateur
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
    path: 'admin/classrooms', 
    component: ClassroomManagementComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] }
  },
  
  // NOUVELLES ROUTES - Gestion des périodes de soumission
  { 
    path: 'admin/periods', 
    component: PeriodManagementComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'admin/periods/:id/statistics', 
    component: SubmissionStatisticsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'admin/periods/:id/exceptions', 
    component: ExceptionPeriodComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
  path: 'admin/departments', 
  component: DepartmentManagementComponent,
  canActivate: [AuthGuard],
  data: { roles: ['ADMIN'] }
},
{ 
  path: 'admin/specialties', 
  component: SpecialtyManagementComponent,
  canActivate: [AuthGuard],
  data: { roles: ['ADMIN'] }
},
{ 
  path: 'admin/levels', 
  component: LevelManagementComponent,
  canActivate: [AuthGuard],
  data: { roles: ['ADMIN'] }
},
{ 
  path: 'admin/groups', 
  component: GroupManagementComponent,
  canActivate: [AuthGuard],
  data: { roles: ['ADMIN'] }
},
  
  // Route professeur
  { 
    path: 'professor/preferences', 
    component: PreferencesFormComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PROFESSOR'] }
  },
  
  // Routes par défaut
  { path: 'unauthorized', component: HomeComponent },
  { path: '**', redirectTo: '' }
];