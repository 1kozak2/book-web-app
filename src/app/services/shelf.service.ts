import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Shelf } from '../shared/components/shelf';

@Injectable({ providedIn: 'root' })
export class ShelfService {
  private api = 'http://localhost:3000/api/user/shelves';

  constructor(private http: HttpClient) {}

  getShelves(): Observable<Shelf[]> {
    return this.http.get<Shelf[]>(this.api);
  }

  createShelf(name: string): Observable<Shelf> {
    return this.http.post<Shelf>(this.api, { name });
  }

  addBookToShelf(shelfId: number, payload: any): Observable<any> {
    return this.http.post(`${this.api}/${shelfId}/books`, payload);
  }
}
