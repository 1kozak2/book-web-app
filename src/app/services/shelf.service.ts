import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ShelfService {
  private api = 'http://localhost:3000/api/user/shelves';

  constructor(private http: HttpClient) {}

  getShelves(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  createShelf(name: string): Observable<any> {
    return this.http.post(this.api, { name });
  }

  addBookToShelf(shelfId: number, payload: any): Observable<any> {
    return this.http.post(`${this.api}/${shelfId}/books`, payload);
  }
}
