import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { take } from 'rxjs/operators';

import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../shared/models/models';

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

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
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

  addToCart(): void {
    if (!this.product) return;

    if (this.quantity <= 0 || this.quantity > this.product.stock) {
      this.error = `Please enter a valid quantity (1 - ${this.product.stock})`;
      this.cdr.detectChanges();
      return;
    }

    this.cartService.addToCart(this.product, this.quantity);
    this.success = `${this.product.name} added to cart!`;
    this.quantity = 1;
    this.cdr.detectChanges();
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }
}