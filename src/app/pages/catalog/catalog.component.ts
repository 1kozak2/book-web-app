import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-catalog',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements OnInit {
  books: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>('https://www.googleapis.com/books/v1/volumes?q=subject:fiction')
      .subscribe(response => {
        this.books = response.items.map((item: any) => ({
          title: item.volumeInfo.title,
          author: item.volumeInfo.authors?.[0] || 'Nieznany autor',
          cover: item.volumeInfo.imageLinks?.thumbnail || ''
        }));
      });
  }
}