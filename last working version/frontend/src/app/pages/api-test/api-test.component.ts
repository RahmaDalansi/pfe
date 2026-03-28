import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Professor, Schedule } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-api-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="api-test-container">
      <h2>Backend Connection Test</h2>
      
      <div *ngIf="!authService.isAuthenticated()" class="warning">
        ⚠️ You are not logged in! Please login first.
      </div>

      <div *ngIf="authService.isAuthenticated()" class="success">
        ✅ Logged in as: {{ authService.getUsername() }}
      </div>

      <div class="test-section">
        <h3>Admin Endpoint: Professors</h3>
        <button (click)="testProfessors()" [disabled]="!authService.isAuthenticated()">
          Fetch Professors
        </button>
        
        <div *ngIf="professors" class="data-display">
          <h4>Professors from Backend:</h4>
          <pre>{{ professors | json }}</pre>
        </div>
        
        <div *ngIf="professorsError" class="error">
          Error: {{ professorsError }}
        </div>
      </div>

      <div class="test-section">
        <h3>Professor Endpoint: Schedule</h3>
        <button (click)="testSchedule()" [disabled]="!authService.isAuthenticated()">
          Fetch Schedule
        </button>
        
        <div *ngIf="schedule" class="data-display">
          <h4>Schedule from Backend:</h4>
          <pre>{{ schedule | json }}</pre>
        </div>
        
        <div *ngIf="scheduleError" class="error">
          Error: {{ scheduleError }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .api-test-container {
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
    }
    .test-section {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    button {
      background: #3498db;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      margin: 10px 0;
    }
    button:disabled {
      background: #95a5a6;
      cursor: not-allowed;
    }
    button:hover:not(:disabled) {
      background: #2980b9;
    }
    .data-display {
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 15px;
      margin: 10px 0;
    }
    pre {
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .error {
      color: #e74c3c;
      background: #fdf0ed;
      padding: 10px;
      border-radius: 4px;
      margin: 10px 0;
    }
    .warning {
      color: #e67e22;
      background: #fef5e7;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
      font-size: 16px;
    }
    .success {
      color: #27ae60;
      background: #e9f7ef;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
      font-size: 16px;
    }
  `]
})
export class ApiTestComponent implements OnInit {
  professors: Professor[] | null = null;
  professorsError: string | null = null;
  
  schedule: Schedule | null = null;
  scheduleError: string | null = null;

  constructor(
    public authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    console.log('Auth state on init:', this.authService.isAuthenticated());
    console.log('Token:', this.authService.getToken());
  }

  testProfessors() {
    this.professors = null;
    this.professorsError = null;
    
    console.log('Fetching professors...');
    this.apiService.getProfessors().subscribe({
      next: (data) => {
        console.log('Professors received:', data);
        this.professors = data;
      },
      error: (error) => {
        console.error('Error fetching professors:', error);
        this.professorsError = error.message || 'Failed to fetch professors';
      }
    });
  }

  testSchedule() {
    this.schedule = null;
    this.scheduleError = null;
    
    console.log('Fetching schedule...');
    this.apiService.getProfessorSchedule().subscribe({
      next: (data) => {
        console.log('Schedule received:', data);
        this.schedule = data;
      },
      error: (error) => {
        console.error('Error fetching schedule:', error);
        this.scheduleError = error.message || 'Failed to fetch schedule';
      }
    });
  }
}