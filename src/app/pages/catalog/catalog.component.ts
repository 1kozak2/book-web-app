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

    this.http.get<any>(`${this.apiUrl}/api/books/search?q=${encodeURIComponent(this.searchTerm)}&startIndex=${this.startIndex}&maxResults=${this.maxResults}`)
      .subscribe(response => {
        const rawItems = Array.isArray(response) ? response : response.items || [];
        this.books = this.mapToBooks(rawItems);
        this.startIndex = this.books.length;
        this.loading = false;
      });
  }

  loadMore(): void {
    this.loading = true;

    this.http.get<any>(`${this.apiUrl}/api/books/search?q=${encodeURIComponent(this.lastQuery)}&startIndex=${this.startIndex}&maxResults=${this.maxResults}`)
      .subscribe(response => {
        const rawItems = Array.isArray(response) ? response : response.items || [];
        const newBooks = this.mapToBooks(rawItems);
        this.books = [...this.books, ...newBooks];
        this.startIndex += this.maxResults;
        this.loading = false;
      });
  }

  sortedBooks(): Book[] {
    if (!Array.isArray(this.books)) return [];
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

  private mapToBooks(raw: any[]): Book[] {
    return raw
      .filter(item => item.volumeInfo?.title && item.volumeInfo?.imageLinks?.thumbnail)
      .map(item => ({
        id: item.id,
        volumeInfo: {
          title: item.volumeInfo.title,
          subtitle: item.volumeInfo.subtitle,
          description: item.volumeInfo.description,
          publishedDate: item.volumeInfo.publishedDate,
          pageCount: item.volumeInfo.pageCount,
          language: item.volumeInfo.language,
          averageRating: item.volumeInfo.averageRating,
          ratingsCount: item.volumeInfo.ratingsCount,
          authors: item.volumeInfo.authors,
          categories: item.volumeInfo.categories,
          imageLinks: {
            thumbnail: item.volumeInfo.imageLinks?.thumbnail
          },
          infoLink: item.volumeInfo.infoLink
        }
      }));
  }
}
