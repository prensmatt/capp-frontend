import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs/operators';

import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../shared/models/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading: boolean = false;
  error: string = '';
  limit: number = 10;
  offset: number = 0;

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAll(this.limit, this.offset)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.products = [...(data ?? [])];
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log('error:', err);
          this.error = 'Could not load products';
          this.cdr.detectChanges();
        }
      });
  }

  nextPage(): void {
    this.offset += this.limit;
    this.loadProducts();
  }

  prevPage(): void {
    if (this.offset >= this.limit) {
      this.offset -= this.limit;
      this.loadProducts();
    }
  }
}