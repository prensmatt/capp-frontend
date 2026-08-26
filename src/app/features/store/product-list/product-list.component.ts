import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs/operators';

import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../shared/models/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading: boolean = false;
  error: string = '';
  limit: number = 12;
  offset: number = 0;
  searchQuery: string = '';

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
          this.filteredProducts = [...this.products];
          this.applyFilter();
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = 'Could not load products';
          this.cdr.detectChanges();
        }
      });
  }

  applyFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredProducts = [...this.products];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredProducts = this.products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }
    this.cdr.detectChanges();
  }

  onSearch(): void {
    this.applyFilter();
  }

  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return 'https://placehold.co/280x200?text=No+Image';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:8080${imageUrl}`;
  }

  nextPage(): void {
    this.offset += this.limit;
    this.searchQuery = '';
    this.loadProducts();
  }

  prevPage(): void {
    if (this.offset >= this.limit) {
      this.offset -= this.limit;
      this.searchQuery = '';
      this.loadProducts();
    }
  }
}