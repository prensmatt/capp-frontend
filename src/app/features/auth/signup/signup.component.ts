import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SignupRequest } from '../../../shared/models/models';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class SignupComponent {
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  
  // Extra property to track confirm password field in template
  confirmPassword: string = '';

  data: SignupRequest = {
    name: '',
    email: '',
    password: '',
    role: 'customer'
  };

  error: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    // Reset state
    this.error = '';

    // Frontend validation: Check if passwords match
    if (this.data.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;

    this.authService.signup(this.data).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Could not create account. Email may already be taken.';
        this.loading = false;
      }
    });
  }
}