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
  searchTitle = '';
  searchAuthor = '';
  selectedCategory = '';
  sortOption: string = 'titleAsc';
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
    const qParts: string[] = [];
    if (this.searchTitle.trim()) qParts.push(`intitle:${this.searchTitle.trim()}`);
    if (this.searchAuthor.trim()) qParts.push(`inauthor:${this.searchAuthor.trim()}`);
    if (this.selectedCategory) qParts.push(`subject:${this.selectedCategory}`);
    const q = qParts.join('+');
    if (!q) {
      this.loadFeatured();
      return;
    }

    this.loading = true;
    this.startIndex = 0;
    this.lastQuery = q;

    this.http.get<any>(`${this.apiUrl}/api/books/search?q=${encodeURIComponent(q)}&startIndex=${this.startIndex}&maxResults=${this.maxResults}`)
      .subscribe(response => {
        const rawItems = Array.isArray(response) ? response : response.items || [];
        this.books = this.mapToBooks(rawItems);
        this.startIndex = this.books.length;
        this.loading = false;
      });
  }

  loadMore(): void {
    this.loading = true;
    const endpoint = this.lastQuery
      ? `${this.apiUrl}/api/books/search?q=${encodeURIComponent(this.lastQuery)}&startIndex=${this.startIndex}&maxResults=${this.maxResults}`
      : `${this.apiUrl}/api/books/featured?startIndex=${this.startIndex}&maxResults=${this.maxResults}`;

    this.http.get<any>(endpoint)
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
      switch (this.sortOption) {
        case 'titleAsc':
          return a.volumeInfo.title.localeCompare(b.volumeInfo.title);
        case 'titleDesc':
          return b.volumeInfo.title.localeCompare(a.volumeInfo.title);
        case 'authorAsc':
          return (a.volumeInfo.authors?.[0] || '').localeCompare(b.volumeInfo.authors?.[0] || '');
        case 'authorDesc':
          return (b.volumeInfo.authors?.[0] || '').localeCompare(a.volumeInfo.authors?.[0] || '');
        case 'newest':
          return new Date(b.volumeInfo.publishedDate || '').getTime() - new Date(a.volumeInfo.publishedDate || '').getTime();
        case 'oldest':
          return new Date(a.volumeInfo.publishedDate || '').getTime() - new Date(b.volumeInfo.publishedDate || '').getTime();
        case 'rating':
          return (b.volumeInfo.averageRating ?? 0) - (a.volumeInfo.averageRating ?? 0);
        case 'reviews':
          return (b.volumeInfo.ratingsCount ?? 0) - (a.volumeInfo.ratingsCount ?? 0);
        default:
          return 0;
      }
    });
  }

  loadFeatured(): void {
    this.loading = true;
    this.startIndex = 0;
    this.http.get<any>(`${this.apiUrl}/api/books/featured?startIndex=${this.startIndex}&maxResults=${this.maxResults}`)
      .subscribe(response => {
        const rawItems = Array.isArray(response) ? response : response.items || [];
        this.books = this.mapToBooks(rawItems);
        this.startIndex = this.books.length;
        this.lastQuery = '';
        this.loading = false;
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
          averageRating: item.volumeInfo.averageRating ?? 0,
          ratingsCount: item.volumeInfo.ratingsCount ?? 0,
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
