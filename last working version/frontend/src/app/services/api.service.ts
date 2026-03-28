import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Professor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  specialization: string;
  hireDate: string;
}

export interface Course {
  subject: string;
  time: string;
  group: string;
  class: string;
  day: string;
}

export interface Schedule {
  courses: Course[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8082/api';

  constructor(private http: HttpClient) {}

  // Admin endpoints
  getProfessors(): Observable<Professor[]> {
    return this.http.get<Professor[]>(`${this.apiUrl}/admin/professors`);
  }

  // Professor endpoints
  getProfessorSchedule(): Observable<Schedule> {
    return this.http.get<Schedule>(`${this.apiUrl}/professor/schedule`);
  }
}