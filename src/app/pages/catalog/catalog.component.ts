import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BookCardComponent } from '../../shared/components/book-card/book-card.component';
import { Book } from '../../shared/components/book';

@Component({
  standalone: true,
  selector: 'app-catalog',
  imports: [CommonModule, HttpClientModule, FormsModule, BookCardComponent],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements OnInit {
  books: Book[] = [];
  searchTerm = 'fiction';
  sortBy: 'title' | 'author' = 'title';
  startIndex = 0;
  maxResults = 20;
  loading = false;
  lastQuery = '';
  apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.searchBooks();
  }

  searchBooks(): void {
    if (!this.searchTerm.trim()) return;

    this.loading = true;
    this.startIndex = 0;
    this.lastQuery = this.searchTerm;

    this.http.get<Book[]>(`${this.apiUrl}/api/books/search?q=${encodeURIComponent(this.searchTerm)}&startIndex=0&maxResults=${this.maxResults}`)
      .subscribe(response => {
        this.books = response;
        this.startIndex = response.length;
        this.loading = false;
      });
  }

  loadMore(): void {
    this.loading = true;

    this.http.get<Book[]>(`${this.apiUrl}/api/books/search?q=${encodeURIComponent(this.lastQuery)}&startIndex=${this.startIndex}&maxResults=${this.maxResults}`)
      .subscribe(newResults => {
        this.books = [...this.books, ...newResults];
        this.startIndex += this.maxResults;
        this.loading = false;
      });
  }

  sortedBooks(): Book[] {
    return this.books.slice().sort((a, b) => {
      const aValue = this.sortBy === 'author'
        ? a.volumeInfo.authors?.[0] || ''
        : a.volumeInfo.title;
      const bValue = this.sortBy === 'author'
        ? b.volumeInfo.authors?.[0] || ''
        : b.volumeInfo.title;
      return aValue.localeCompare(bValue);
    });
  }
}
