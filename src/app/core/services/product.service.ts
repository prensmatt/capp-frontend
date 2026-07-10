import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "../../../environments/environment";
import { Product } from "../../shared/models/models";

@Injectable({
  providedIn: 'root'
})

export class ProductService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient){}

  getAll(limit: number = 10, offset: number = 0): Observable<Product[]>{
    const params = new HttpParams()
    .set('limit',limit.toString())
    .set('offset',offset.toString());

    return this.http.get<Product[]>(`${this.apiUrl}/products`,{params});
  }

  getById(id: number): Observable<Product>{
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  create(product: Partial<Product>): Observable<Product>{
    return this.http.post<Product>(`${this.apiUrl}/products`,product);
  }

  update(id: number, product: Partial<Product>): Observable<Product>{
    return this.http.put<Product>(`${this.apiUrl}/products/${id}`,product);
  }

  delete(id: number): Observable<void>{
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
  }

  uploadImage(id: number, file: File): Observable<{image_url: string}>{
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{image_url: string}>(`${this.apiUrl}/products/${id}/image`,formData);
  }
}
