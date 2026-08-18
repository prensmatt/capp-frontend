import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../shared/models/models';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getAll(this.limit, this.offset).subscribe({
      next: (data) => {
        this.orders = data || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load orders';
        this.loading = false;
      }
    });
  }

  updateStatus(id: number, status: string): void {
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