import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { KeycloakAuthService } from './keycloak.service';
import { Department, Specialty, Level, Group } from '../models/department.models';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = 'http://localhost:8082/api/admin';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakAuthService
  ) {}

  private getHeaders(): Observable<HttpHeaders> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        return new Observable<HttpHeaders>(observer => {
          observer.next(new HttpHeaders().set('Authorization', `Bearer ${token}`));
          observer.complete();
        });
      })
    );
  }

  // ==================== DÉPARTEMENTS ====================
  getDepartments(activeOnly?: boolean): Observable<Department[]> {
    return this.getHeaders().pipe(
      switchMap(headers => {
        let params = new HttpParams();
        if (activeOnly !== undefined) {
          params = params.set('activeOnly', activeOnly.toString());
        }
        return this.http.get<Department[]>(`${this.apiUrl}/departments`, { headers, params });
      })
    );
  }

  getDepartmentById(id: number): Observable<Department> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.get<Department>(`${this.apiUrl}/departments/${id}`, { headers }))
    );
  }

  createDepartment(department: Partial<Department>): Observable<Department> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.post<Department>(`${this.apiUrl}/departments`, department, { headers }))
    );
  }

  updateDepartment(id: number, department: Partial<Department>): Observable<Department> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.put<Department>(`${this.apiUrl}/departments/${id}`, department, { headers }))
    );
  }

  deleteDepartment(id: number): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.delete(`${this.apiUrl}/departments/${id}`, { headers }))
    );
  }

  hardDeleteDepartment(id: number): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.delete(`${this.apiUrl}/departments/${id}/hard`, { headers }))
    );
  }

  // ==================== SPÉCIALITÉS ====================
  getSpecialties(activeOnly?: boolean, departmentId?: number): Observable<Specialty[]> {
    return this.getHeaders().pipe(
      switchMap(headers => {
        let params = new HttpParams();
        if (activeOnly !== undefined) {
          params = params.set('activeOnly', activeOnly.toString());
        }
        if (departmentId !== undefined) {
          params = params.set('departmentId', departmentId.toString());
        }
        return this.http.get<Specialty[]>(`${this.apiUrl}/specialties`, { headers, params });
      })
    );
  }

  getSpecialtyById(id: number): Observable<Specialty> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.get<Specialty>(`${this.apiUrl}/specialties/${id}`, { headers }))
    );
  }

  createSpecialty(specialty: Partial<Specialty>): Observable<Specialty> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.post<Specialty>(`${this.apiUrl}/specialties`, specialty, { headers }))
    );
  }

  updateSpecialty(id: number, specialty: Partial<Specialty>): Observable<Specialty> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.put<Specialty>(`${this.apiUrl}/specialties/${id}`, specialty, { headers }))
    );
  }

  deleteSpecialty(id: number): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.delete(`${this.apiUrl}/specialties/${id}`, { headers }))
    );
  }

  hardDeleteSpecialty(id: number): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.delete(`${this.apiUrl}/specialties/${id}/hard`, { headers }))
    );
  }

  // ==================== NIVEAUX ====================
  getLevels(activeOnly?: boolean, specialtyId?: number): Observable<Level[]> {
    return this.getHeaders().pipe(
      switchMap(headers => {
        let params = new HttpParams();
        if (activeOnly !== undefined) {
          params = params.set('activeOnly', activeOnly.toString());
        }
        if (specialtyId !== undefined) {
          params = params.set('specialtyId', specialtyId.toString());
        }
        return this.http.get<Level[]>(`${this.apiUrl}/levels`, { headers, params });
      })
    );
  }

  getLevelById(id: number): Observable<Level> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.get<Level>(`${this.apiUrl}/levels/${id}`, { headers }))
    );
  }

  createLevel(level: Partial<Level>): Observable<Level> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.post<Level>(`${this.apiUrl}/levels`, level, { headers }))
    );
  }

  updateLevel(id: number, level: Partial<Level>): Observable<Level> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.put<Level>(`${this.apiUrl}/levels/${id}`, level, { headers }))
    );
  }

  deleteLevel(id: number): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.delete(`${this.apiUrl}/levels/${id}`, { headers }))
    );
  }

  hardDeleteLevel(id: number): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.delete(`${this.apiUrl}/levels/${id}/hard`, { headers }))
    );
  }

  // ==================== GROUPES ====================
  getGroups(activeOnly?: boolean, levelId?: number): Observable<Group[]> {
    return this.getHeaders().pipe(
      switchMap(headers => {
        let params = new HttpParams();
        if (activeOnly !== undefined) {
          params = params.set('activeOnly', activeOnly.toString());
        }
        if (levelId !== undefined) {
          params = params.set('levelId', levelId.toString());
        }
        return this.http.get<Group[]>(`${this.apiUrl}/groups`, { headers, params });
      })
    );
  }

  getGroupById(id: number): Observable<Group> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.get<Group>(`${this.apiUrl}/groups/${id}`, { headers }))
    );
  }

  createGroup(group: Partial<Group>): Observable<Group> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.post<Group>(`${this.apiUrl}/groups`, group, { headers }))
    );
  }

  updateGroup(id: number, group: Partial<Group>): Observable<Group> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.put<Group>(`${this.apiUrl}/groups/${id}`, group, { headers }))
    );
  }

  deleteGroup(id: number): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.delete(`${this.apiUrl}/groups/${id}`, { headers }))
    );
  }

  hardDeleteGroup(id: number): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.delete(`${this.apiUrl}/groups/${id}/hard`, { headers }))
    );
  }
}