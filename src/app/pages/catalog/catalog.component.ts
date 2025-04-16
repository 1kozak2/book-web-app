import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  link: string;
}

@Component({
  standalone: true,
  selector: 'app-catalog',
  imports: [CommonModule, HttpClientModule, FormsModule],
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

    this.http.get<any>(`${this.apiUrl}/api/books/search?q=${encodeURIComponent(this.searchTerm)}&startIndex=0&maxResults=${this.maxResults}`)
      .subscribe(response => {
        const results = response.items || [];
        this.books = this.extractBooks(results);
        this.startIndex = results.length;
        this.loading = false;
      });
  }

  loadMore(): void {
    this.loading = true;

    this.http.get<any>(`${this.apiUrl}/api/books/search?q=${encodeURIComponent(this.lastQuery)}&startIndex=${this.startIndex}&maxResults=${this.maxResults}`)
      .subscribe(response => {
        const newResults = response.items || [];
        const newBooks = this.extractBooks(newResults);
        this.books = [...this.books, ...newBooks];
        this.startIndex += this.maxResults;
        this.loading = false;
      });
  }

  extractBooks(results: any[]): Book[] {
    return results
      .filter(b => b.volumeInfo?.title && b.volumeInfo?.imageLinks?.thumbnail)
      .map(b => ({
        id: b.id,
        title: b.volumeInfo.title,
        author: b.volumeInfo.authors?.[0] || 'Unknown Author',
        cover: b.volumeInfo.imageLinks.thumbnail,
        link: b.volumeInfo.infoLink || '#'
      }));
  }

  sortedBooks(): Book[] {
    return this.books.sort((a, b) => a[this.sortBy].localeCompare(b[this.sortBy]));
  }

  openBook(book: Book): void {
    window.open(book.link, '_blank');
  }
}
