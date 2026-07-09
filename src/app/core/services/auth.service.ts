import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, SignupRequest, User } from '../../shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient){}

  signup(data: SignupRequest): Observable<User>{
    return this.http.post<User>(`${this.apiUrl}/signup`,data);
  }

  login(data: LoginRequest): Observable<AuthResponse>{
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`,data).pipe(
      tap(response => {
        localStorage.setItem('token',response.token);
        localStorage.setItem('role', this.getRoleFromToken(response.token));
      })
    );
  }

  logout(): void{
    localStorage.removeItem('token')
    localStorage.removeItem('role')
  }

  getToken(): string | null{
    return localStorage.getItem('token')
  }
  isLoggedIn(): boolean{
    return !!this.getToken();
  }
  isAdmin(): boolean{
    return localStorage.getItem('role') === 'admin';
  }

  private getRoleFromToken(token: string): string{
    try{
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || 'customer';
    }
    catch{
      return 'customer';
    }
  }
}