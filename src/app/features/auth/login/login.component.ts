import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginRequest } from '../../../shared/models/models';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})


export class LoginComponent {
  credentials: LoginRequest={
    email: '',
    password: ''
  };
  error: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ){}

  onSubmit():void{
    this.loading = true;
    this.error = ''

    this.authService.login(this.credentials).subscribe({
      next: () => {
        if(this.authService.isAdmin()){
          this.router.navigate(['/admin/products']);
        } else{
          this.router.navigate(['/products']);
        }
      },
      error: ()=>{
        this.error = 'Invalid email or password';
        this.loading = false;
      }
    });
  }
}
