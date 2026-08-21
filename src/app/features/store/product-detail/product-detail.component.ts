import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { take } from 'rxjs/operators';

import { ProductService } from '../../../core/services/product.service';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../shared/models/models';
import { Order, CreateOrderRequest } from '../../../shared/models/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading: boolean = false;
  error: string = '';
  success: string = '';
  quantity: number = 1;
  ordering: boolean = false;

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loading = true;
      this.productService.getById(id)
        .pipe(take(1))
        .subscribe({
          next: (data) => {
            this.product = data;
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.error = 'Product not found';
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
    }
  }

  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return 'https://placehold.co/400x300?text=No+Image';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:8080${imageUrl}`;
  }

  placeOrder(): void {
    if (!this.product) return;

    if (!this.authService.isLoggedIn()) {
      this.error = 'Please login to place an order';
      this.cdr.detectChanges();
      return;
    }

    if (this.quantity <= 0 || this.quantity > this.product.stock) {
      this.error = `Please enter a valid quantity (1 - ${this.product.stock})`;
      this.cdr.detectChanges();
      return;
    }

    this.ordering = true;
    this.error = '';
    this.success = '';

    const order: CreateOrderRequest = {
      user_id: 1,
      items: [
        {
          product_id: this.product.id,
          quantity: this.quantity,
          unit_price: this.product.price
        }
      ]
    };

    this.orderService.create(order).subscribe({
      next: (data) => {
        this.success = `Order #${data.id} placed successfully! Total: $${data.total_price}`;
        this.product!.stock -= this.quantity;
        this.quantity = 1;
        this.ordering = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Could not place order. Please try again.';
        this.ordering = false;
        this.cdr.detectChanges();
      }
    });
  }
}