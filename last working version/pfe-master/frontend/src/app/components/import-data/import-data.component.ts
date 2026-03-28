import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-import-data',
  templateUrl: './import-data.component.html',
  standalone: true
})
export class ImportDataComponent {
  message: string = '';
  constructor(private http: HttpClient) {}

  onFileChange(event: any, role: string) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      this.http.post(http://localhost:8082/api/import/\, formData, { responseType: 'text' })
          .subscribe({ next: (res) => this.message = res, error: (err) => this.message = 'Erreur : ' + err.message });
    }
  }
}
