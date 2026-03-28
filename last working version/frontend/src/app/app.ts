import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/HeaderComponent/header.component';
import { FooterComponent } from './components/FooterComponent/footer.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  initialized = false;

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    await this.authService.init();
    this.initialized = true;
  }
}