import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order, Product } from '../../../shared/models/models';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-history.html',
  styleUrl: './order-history.css'
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  products: Map<number, Product> = new Map();
  loading: boolean = false;
  error: string = '';

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getAll().subscribe({
      next: (data) => {
        const userId = this.authService.getUserId();
        this.orders = [...(data ?? [])].filter(o => o.user_id === userId);

        // fetch full details for each order to get items
        let loaded = 0;
        if (this.orders.length === 0) {
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        this.orders.forEach((order, index) => {
          this.orderService.getById(order.id).subscribe({
            next: (fullOrder) => {
              this.orders[index] = fullOrder;
              loaded++;
              if (loaded === this.orders.length) {
                this.loadProductNames();
              }
            },
            error: () => {
              loaded++;
              if (loaded === this.orders.length) {
                this.loadProductNames();
              }
            }
          });
        });
      },
      error: () => {
        this.error = 'Could not load orders';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadProductNames(): void {
    const productIds = new Set<number>();
    this.orders.forEach(order => {
      order.items?.forEach(item => productIds.add(item.product_id));
    });

    let loaded = 0;
    const total = productIds.size;

    if (total === 0) {
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    productIds.forEach(id => {
      this.productService.getById(id).subscribe({
        next: (product) => {
          this.products.set(id, product);
          loaded++;
          if (loaded === total) {
            this.loading = false;
            this.cdr.detectChanges();
          }
        },
        error: () => {
          loaded++;
          if (loaded === total) {
            this.loading = false;
            this.cdr.detectChanges();
          }
        }
      });
    });
  }

  getProductName(productId: number): string {
    return this.products.get(productId)?.name || `Product #${productId}`;
  }

  getProductImage(productId: number): string {
    const imageUrl = this.products.get(productId)?.image_url || '';
    if (!imageUrl) return 'https://placehold.co/60x60?text=No+Image';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:8080${imageUrl}`;
  }

  getStatusClass(status: string): string {
    return 'status-' + status;
  }
}