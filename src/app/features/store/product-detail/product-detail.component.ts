import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { take } from 'rxjs/operators';

import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../shared/models/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading: boolean = false;
  error: string = '';

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  getImageUrl(imageUrl: string): string {
  if (!imageUrl) return 'https://placehold.co/400x300?text=No+Image';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `http://localhost:8080${imageUrl}`;
}

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
}