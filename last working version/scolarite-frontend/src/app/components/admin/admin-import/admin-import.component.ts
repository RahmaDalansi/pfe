import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportService } from '../../../services/import.service';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-admin-import',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-import.component.html',
  styleUrls: ['./admin-import.component.css']
})
export class AdminImportComponent {
  selectedFile: File | null = null;
  uploading = false;
  uploadProgress = 0;
  importResult = '';
  errorMessage = '';

  constructor(private importService: ImportService) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.importResult = '';
    this.errorMessage = '';
  }

  async uploadFile() {
    if (!this.selectedFile) return;

    this.uploading = true;
    this.uploadProgress = 0;

    try {
      const response = await this.importService.importStudents(this.selectedFile);
      response.subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
          } else if (event.type === HttpEventType.Response) {
            this.importResult = `Import réussi: ${event.body.message}`;
            this.uploading = false;
          }
        },
        error: (error: any) => {
          this.errorMessage = 'Erreur lors de l\'import: ' + error.message;
          this.uploading = false;
        }
      });
    } catch (error: any) {
      this.errorMessage = 'Erreur lors de l\'import: ' + error.message;
      this.uploading = false;
    }
  }

  downloadSample() {
    const csv = 'firstName,lastName,email,cin,role\nJohn,Doe,john.doe@example.com,11177640,STUDENT';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-students.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}