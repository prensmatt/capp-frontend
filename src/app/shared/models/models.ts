export interface User{
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface Category{
  id: number;
  name: string;
  slug: string;
}

export interface Product{
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  image_url: string;
  created_at: string;
}

export interface Order{
  id: number;
  user_id: number;
  status: string;
  total_price: number;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem{
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface AuthResponse{
  token: string;
}

export interface LoginRequest{
  email: string;
  password: string;
}

export interface SignupRequest{
  name: string;
  email: string;
  password: string;
  role: string;
}