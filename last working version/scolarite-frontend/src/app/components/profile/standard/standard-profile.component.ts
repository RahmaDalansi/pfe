import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileBaseComponent } from '../shared/profile-base.component';
import { ProfileService } from '../../../services/profile.service';

@Component({
  selector: 'app-standard-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './standard-profile.component.html',
  styleUrls: ['./standard-profile.component.css']
})
export class StandardProfileComponent extends ProfileBaseComponent {
  constructor(protected override profileService: ProfileService) {
    super(profileService);
  }
}