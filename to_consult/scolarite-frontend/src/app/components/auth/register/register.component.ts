import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegistrationService } from '../../../services/registration.service';
import { debounceTime, map, switchMap, first } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  registrationSuccess = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)], [this.usernameValidator()]],
      email: ['', [Validators.required, Validators.email], [this.emailValidator()]],
      cin: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['STUDENT']
    });
  }

  usernameValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) {
        return of(null);
      }
      return control.valueChanges.pipe(
        debounceTime(500),
        switchMap(value => this.registrationService.checkUsername(value)),
        map(response => response.available ? null : { usernameTaken: true }),
        first()
      );
    };
  }

  emailValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) {
        return of(null);
      }
      return control.valueChanges.pipe(
        debounceTime(500),
        switchMap(value => this.registrationService.checkEmail(value)),
        map(response => response.available ? null : { emailTaken: true }),
        first()
      );
    };
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const userData = {
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      cin: this.registerForm.value.cin,
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      role: this.registerForm.value.role
    };

    this.registrationService.register(userData).subscribe({
      next: (response) => {
        console.log('Inscription réussie:', response);
        this.isLoading = false;
        this.registrationSuccess = true;
      },
      error: (error) => {
        console.error('Erreur inscription:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Erreur lors de l\'inscription';
      }
    });
  }
}