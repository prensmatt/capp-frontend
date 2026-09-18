import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product, Category } from '../../../shared/models/models';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-management.html',
  styleUrl: './product-management.css'
})
export class ProductManagementComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  pagedProducts: Product[] = [];
  categories: Category[] = [];
  loading: boolean = false;
  error: string = '';
  success: string = '';
  showForm: boolean = false;
  editingProduct: Product | null = null;
  selectedFile: File | null = null;
  uploadingId: number | null = null;

  // Search
  searchTerm: string = '';

  // Pagination
  pageSize: number = 20;
  currentPage: number = 1;
  totalPages: number = 1;

  form = {
    name: '',
    slug: '',
    description: '',
    price: 0,
    stock: 0,
    category_id: 0
  };

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
    this.loading = true;
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = [...(data ?? [])];
        this.loading = false;
        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Could not load products';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories = data ?? [];
        this.cdr.detectChanges();
      },
      error: () => this.error = 'Could not load categories'
    });
  }

  // --- Search ---
  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.applyFilter();
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredProducts = term
      ? this.products.filter(p => {
          const categoryName =
            this.categories
              .find(c => c.id === p.category_id)
              ?.name
              ?.toLowerCase() || '';

          return (
            p.name?.toLowerCase().includes(term) ||
            p.slug?.toLowerCase().includes(term) ||
            p.description?.toLowerCase().includes(term) ||
            categoryName.includes(term)
          );
        })
      : this.products;

    this.totalPages = Math.max(
      1,
      Math.ceil(this.filteredProducts.length / this.pageSize)
    );

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    this.updatePagedProducts();
  }
  // --- Pagination ---
  updatePagedProducts(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedProducts = this.filteredProducts.slice(start, start + this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedProducts();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedProducts();
    }
  }

  get rangeStart(): number {
    return this.filteredProducts.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredProducts.length);
  }

  openCreateForm(): void {
    this.editingProduct = null;
    this.form = { name: '', slug: '', description: '', price: 0, stock: 0, category_id: 0 };
    this.showForm = true;
    this.error = '';
    this.success = '';
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
    this.error = '';
    this.success = '';
  }

  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  onSubmit(): void {
    this.error = '';
    this.success = '';

    if (!this.form.name.trim()) {
      this.error = 'Product name is required.';
      return;
    }
    if (!this.form.slug.trim()) {
      this.error = 'Slug is required.';
      return;
    }
    if (this.form.price <= 0) {
      this.error = 'Price must be greater than 0.';
      return;
    }
    if (this.form.stock < 0) {
      this.error = 'Stock cannot be negative.';
      return;
    }
    if (!this.form.category_id || this.form.category_id === 0) {
      this.error = 'Please select a category.';
      return;
    }

    if (this.editingProduct) {
      const updateData = {
        ...this.form,
        category_id: Number(this.form.category_id),
        image_url: this.editingProduct.image_url
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
      this.productService.create({
        ...this.form,
        category_id: Number(this.form.category_id)
      }).subscribe({
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
    this.error = '';
    this.success = '';
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
}