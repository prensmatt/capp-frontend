import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../../../core/services/product.service';
import { Category, Product } from '../../../shared/models/models';
import { CategoryService } from '../../../core/services/category.service';

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
  selectedFile: File | null = null;
  uploadingId: number | null = null;

  form = {
    name: '',
    slug: '',
    description: '',
    price: 0,
    stock: 0,
    category_id: 1
  };

  categories: Category[] = [];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = [...(data ?? [])];
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Could not load products';
        this.cdr.detectChanges();
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories = [...(data ?? [])];
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Could not load products';
        this.cdr.detectChanges();
      }
    })
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
      const updateData = {
        ...this.form,
        category_id: Number(this.form.category_id),  // force number
        image_url: this.editingProduct.image_url  // preserve existing image
      };
      this.productService.update(this.editingProduct.id, updateData).subscribe({
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

  onFileSelected(event: Event, productId: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.uploadingId = productId;
      this.uploadImage(productId, input.files[0]);
    }
  }

  uploadImage(productId: number, file: File): void {
    this.productService.uploadImage(productId, file).subscribe({
      next: () => {
        this.success = 'Image uploaded successfully';
        this.selectedFile = null;
        this.uploadingId = null;
        this.loadProducts();
      },
      error: () => {
        this.error = 'Could not upload image';
        this.uploadingId = null;
      }
    });
  }

  getImageUrl(imageUrl: string): string {
    if (!imageUrl) return 'https://placehold.co/60x60?text=No+Image';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:8080${imageUrl}`;
  }

  generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}
}