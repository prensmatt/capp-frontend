import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

import { CartService, CartItem } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { CreateOrderRequest } from '../../../shared/models/models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];
  loading: boolean = false;
  error: string = '';
  success: string = '';

  constructor(
    public cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.items = items;
      this.cdr.detectChanges();
    });
  }

  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return 'https://placehold.co/80x80?text=No+Image';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:8080${imageUrl}`;
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.cartService.removeFromCart(productId);
    } else {
      this.cartService.updateQuantity(productId, quantity);
    }
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  placeOrder(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.items.length === 0) {
      this.error = 'Your cart is empty';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const userId = this.authService.getUserId();
    if (!userId) {
      this.error = 'Could not identify user. Please login again.';
      return;
    }

    const order: CreateOrderRequest = {
      user_id: userId as number,
      items: this.items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price
      }))
    };

    this.orderService.create(order).subscribe({
      next: (data) => {
        this.success = `Order #${data.id} placed successfully! Total: $${data.total_price}`;
        this.cartService.clearCart();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Could not place order. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}