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
export class Signup {
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
  ){}

  onSubmit(): void{
    this.loading = true;
    this.error = '';
  
    this.authService.signup(this.data).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: ()=>{
        this.error = 'Could not create account. Email may already be taken';
        this.loading = false;
      }
    });
  }
}
