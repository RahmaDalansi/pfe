import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterRequest {
  username: string;
  email: string;
  cin: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface CheckResponse {
  available: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private apiUrl = 'http://localhost:8082/api/public/auth';

  constructor(private http: HttpClient) {}

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  checkUsername(username: string): Observable<CheckResponse> {
    return this.http.get<CheckResponse>(`${this.apiUrl}/check-username`, {
      params: { username }
    });
  }

  checkEmail(email: string): Observable<CheckResponse> {
    return this.http.get<CheckResponse>(`${this.apiUrl}/check-email`, {
      params: { email }
    });
  }
}