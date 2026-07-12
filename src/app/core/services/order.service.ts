import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "../../../environments/environment";
import { Order } from "../../shared/models/models"

@Injectable({
  providedIn: 'root'
})

export class OrderService{
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(limit: number = 10, offset: number = 0): Observable<Order[]>{
    const params = new HttpParams()
    .set('limit', limit.toString())
    .set('offset', offset.toString());
    return this.http.get<Order[]>(`${this.apiUrl}/orders`, { params });
  }

  getById(id: number): Observable<Order>{
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`);
  }

  create(order: Partial<Order>): Observable<Order>{
    return this.http.post<Order>(`${this.apiUrl}/orders`, order);
  }

  updateStatus(id: number, status: string): Observable<{status: string}>{
    return this.http.patch<{status: string}>(
      `${this.apiUrl}/orders/${id}/status`,
      {status}
    );
  }
}