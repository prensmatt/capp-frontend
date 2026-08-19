import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../shared/models/models';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-management.html',
  styleUrl: './order-management.css'
})
export class OrderManagementComponent implements OnInit {
  orders: Order[] = [];
  loading: boolean = false;
  error: string = '';
  success: string = '';
  limit: number = 10;
  offset: number = 0;

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getAll(this.limit, this.offset).subscribe({
      next: (data) => {
        this.orders = [...(data ?? [])];
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Could not load orders';
        this.cdr.detectChanges();
      }
    });
  }

  updateStatus(id: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const status = select.value;
    if (!status) return;

    this.orderService.updateStatus(id, status).subscribe({
      next: () => {
        this.success = `Order #${id} status updated to ${status}`;
        this.loadOrders();
      },
      error: () => this.error = 'Could not update order status'
    });
  }

  nextPage(): void {
    this.offset += this.limit;
    this.loadOrders();
  }

  prevPage(): void {
    if (this.offset >= this.limit) {
      this.offset -= this.limit;
      this.loadOrders();
    }
  }
}