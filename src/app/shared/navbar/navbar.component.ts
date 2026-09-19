import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  cartCount: number = 0;
  menuOpen: boolean = false;

  constructor(
    public authService: AuthService,
    public cartService: CartService,
    private router: Router
  ) {}

  isDark: boolean = false;

toggleTheme(): void {
  this.isDark = !this.isDark;
  document.body.classList.toggle('dark-mode', this.isDark);
  localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
}

  ngOnInit(): void {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      this.isDark = true;
      document.body.classList.add('dark-mode');
    }

    this.cartService.cart$.subscribe(() => {
      this.cartCount = this.cartService.getCount();
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}