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

    const userId = this.authService.getUserId();
    if (!userId) {
      this.error = 'Could not identify user. Please login again.';
      return;
    }

    if (this.items.length === 0) {
      this.error = 'Your cart is empty';
      return;
    }

    // validate quantities
    for (const item of this.items) {
      if (item.quantity > item.product.stock) {
        this.error = `"${item.product.name}" only has ${item.product.stock} items left. Please update quantity.`;
        this.cdr.detectChanges();
        return;
      }
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const order: CreateOrderRequest = {
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
        setTimeout(() => {
          this.router.navigate(['/orders']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 422) {
          this.error = 'One or more items are out of stock. Please update your cart.';
        } else if (err.status === 401) {
          this.error = 'Your session has expired. Please login again.';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        } else if (err.status === 400) {
          this.error = 'Invalid order data. Please check your cart and try again.';
        } else {
          this.error = 'Could not place order. Please try again.';
        }
        this.cdr.detectChanges();
      }
    });
  }
}