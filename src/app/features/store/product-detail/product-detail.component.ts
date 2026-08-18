import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

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
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loading = true;
      this.productService.getById(id).subscribe({
        next: (data) => {
          this.product = data;
          this.loading = false;
        },
        error: () => {
          this.error = 'Product not found';
          this.loading = false;
        }
      });
    }
  }
}