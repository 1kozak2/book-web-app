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
  searchTerm = '';
  sortBy: 'title' | 'author' = 'title';
  startIndex = 0;
  maxResults = 20;
  loading = false;
  lastQuery = 'fiction';
  apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.searchTerm = 'fiction';
    this.searchBooks();
  }

  searchBooks(): void {
    if (!this.searchTerm.trim()) return;

    this.loading = true;
    this.startIndex = 0;
    this.lastQuery = this.searchTerm;

    this.http.get<any>(`${this.apiUrl}/search?q=${encodeURIComponent(this.searchTerm)}`)
      .subscribe(response => {
        const results = response.items || [];

        this.books = results
          .filter((b: any) => b.volumeInfo?.title && b.volumeInfo?.imageLinks?.thumbnail)
          .map((book: any): Book => ({
            id: book.id,
            title: book.volumeInfo.title,
            author: book.volumeInfo.authors?.[0] || 'Nieznany autor',
            cover: book.volumeInfo.imageLinks.thumbnail,
            link: book.volumeInfo.infoLink || '#'
          }));

        this.startIndex = results.length;
        this.loading = false;
      });
  }

  loadMore(): void {
    this.loading = true;

    this.http.get<any>(`${this.apiUrl}/search?q=${encodeURIComponent(this.lastQuery)}&startIndex=${this.startIndex}&maxResults=${this.maxResults}`)
      .subscribe(response => {
        const newResults = response.items || [];

        const newBooks = newResults
          .filter((b: any) => b.volumeInfo?.title && b.volumeInfo?.imageLinks?.thumbnail)
          .map((book: any): Book => ({
            id: book.id,
            title: book.volumeInfo.title,
            author: book.volumeInfo.authors?.[0] || 'Nieznany autor',
            cover: book.volumeInfo.imageLinks.thumbnail,
            link: book.volumeInfo.infoLink || '#'
          }));

        this.books = [...this.books, ...newBooks];
        this.startIndex += this.maxResults;
        this.loading = false;
      });
  }

  sortedBooks(): Book[] {
    return this.books.sort((a: Book, b: Book) => a[this.sortBy].localeCompare(b[this.sortBy]));
  }

  openBook(book: Book): void {
    window.open(book.link, '_blank');
  }
}
