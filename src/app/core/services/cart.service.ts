import { Injectable } from "@angular/core";
import { Product } from "../../shared/models/models";
import { BehaviorSubject } from "rxjs";

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})

export class CartService {
  private items: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);

  cart$ = this.cartSubject.asObservable();

  addToCart(product:Product, quantity:number):void{
    const existing = this.items.find(item=>item.product.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else{
      this.items.push({product,quantity});
    }
    this.cartSubject.next([...this.items]);
  }

  removeFromCart(productId:number):void{
    this.items = this.items.filter(item=> item.product.id !== productId);
    this.cartSubject.next([...this.items]);
  }

  updateQuantity(productId:number, quantity:number):void{
    const item = this.items.find(item=>item.product.id === productId);
    if(item){
      item.quantity = quantity
      this.cartSubject.next([...this.items]);
    }
  }

  clearCart():void{
    this.items = []
    this.cartSubject.next([]);
  }

  getItems(): CartItem[]{
    return this.items;
  }

  getTotal(): number{
    return this.items.reduce((sum,item)=>sum +(item.product.price*item.quantity),0);
  }

  getCount(): number{
    return this.items.reduce((sum,item)=>sum + item.quantity,0)
  }
}