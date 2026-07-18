import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
    .then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: ()=> import('./features/auth/signup/signup.component')
    .then(m=> m.SignupComponent)
  },
  {
    path: 'products',
    loadComponent: ()=> import('./features/store/product-list/product-list.component')
    .then(m=> m.ProductListComponent)
  },
  {
    path: 'products/:id',
    loadComponent: ()=> import('./features/store/product-detail/product-detail.component')
    .then(m=> m.ProductDetailComponent)   
  },
  {
    path: 'admin',
    canActivate: [AdminGuard],
    children: [
      {
        path: 'products',
        loadComponent: ()=>import('./features/admin/product-management/product-management.component')
        .then(m=>m.ProductManagementComponent)
      },
      {
        path: 'orders',
        loadComponent: ()=>import('./features/admin/order-management/order-management.component')
        .then(m=>m.OrderManagementComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'products'
  }
];
