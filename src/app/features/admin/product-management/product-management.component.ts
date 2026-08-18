import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../shared/models/models';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-management.html',
  styleUrl: './product-management.css'
})
export class ProductManagementComponent implements OnInit {
  products: Product[] = [];
  loading: boolean = false;
  error: string = '';
  success: string = '';

  showForm: boolean = false;
  editingProduct: Product | null = null;

  form = {
    name: '',
    slug: '',
    description: '',
    price: 0,
    stock: 0,
    category_id: 1
  };

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load products';
        this.loading = false;
      }
    });
  }

  openCreateForm(): void {
    this.editingProduct = null;
    this.form = { name: '', slug: '', description: '', price: 0, stock: 0, category_id: 1 };
    this.showForm = true;
  }

  openEditForm(product: Product): void {
    this.editingProduct = product;
    this.form = {
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category_id: product.category_id
    };
    this.showForm = true;
  }

  onSubmit(): void {
    this.error = '';
    this.success = '';

    if (this.editingProduct) {
      this.productService.update(this.editingProduct.id, this.form).subscribe({
        next: () => {
          this.success = 'Product updated successfully';
          this.showForm = false;
          this.loadProducts();
        },
        error: () => this.error = 'Could not update product'
      });
    } else {
      this.productService.create(this.form).subscribe({
        next: () => {
          this.success = 'Product created successfully';
          this.showForm = false;
          this.loadProducts();
        },
        error: () => this.error = 'Could not create product'
      });
    }
  }

  deleteProduct(id: number): void {
    if (!confirm('Are you sure you want to delete this product?')) return;

    this.productService.delete(id).subscribe({
      next: () => {
        this.success = 'Product deleted';
        this.loadProducts();
      },
      error: () => this.error = 'Could not delete product'
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingProduct = null;
  }
}