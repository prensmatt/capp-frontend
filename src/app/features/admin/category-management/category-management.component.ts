import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../shared/models/models';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './category-management.html',
  styleUrl: './category-management.css'
})
export class CategoryManagementComponent implements OnInit {
  categories: Category[] = [];
  loading: boolean = false;
  error: string = '';
  success: string = '';
  showForm: boolean = false;
  editingCategory: Category | null = null;

  form = {
    name: '',
    slug: ''
  };

  constructor(
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories = [...(data ?? [])];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Could not load categories';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCreateForm(): void {
    this.editingCategory = null;
    this.form = { name: '', slug: '' };
    this.showForm = true;
  }

  openEditForm(category: Category): void {
    this.editingCategory = category;
    this.form = { name: category.name, slug: category.slug };
    this.showForm = true;
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

    if (this.editingCategory) {
      this.categoryService.update(this.editingCategory.id, this.form).subscribe({
        next: () => {
          this.success = 'Category updated successfully';
          this.showForm = false;
          this.loadCategories();
        },
        error: () => this.error = 'Could not update category'
      });
    } else {
      this.categoryService.create(this.form).subscribe({
        next: () => {
          this.success = 'Category created successfully';
          this.showForm = false;
          this.loadCategories();
        },
        error: () => this.error = 'Could not create category'
      });
    }
  }

  deleteCategory(id: number): void {
    if (!confirm('Are you sure? Products in this category will lose their category.')) return;
    this.categoryService.delete(id).subscribe({
      next: () => {
        this.success = 'Category deleted';
        this.loadCategories();
      },
      error: () => this.error = 'Could not delete category'
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingCategory = null;
  }
}