import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// Interface that defines the shape of a Book object
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
  // Array to hold books
  books: Book[] = [];

  // Search input from user
  searchTerm = '';

  // Field to sort by (title or author)
  sortBy: 'title' | 'author' = 'title';

  // Pagination: index of first result and max per request
  startIndex = 0;
  maxResults = 20;

  // Loading state to show spinner or disable button
  loading = false;

  // The last search query (used for pagination)
  lastQuery = 'fiction';

  // URL of the backend API (your own server)
  apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // On component init, load default set of books
  ngOnInit() {
    this.searchTerm = 'fiction';
    this.searchBooks();
  }

  // Method to search books using backend API
  searchBooks(): void {
    if (!this.searchTerm.trim()) return;

    this.loading = true;
    this.startIndex = 0;
    this.lastQuery = this.searchTerm;

    // Send request to backend API
    this.http.get<any>(`${this.apiUrl}/search?q=${encodeURIComponent(this.searchTerm)}`)
      .subscribe(response => {
        const results = response.items || [];

        // Convert raw API response into Book[] objects
        this.books = results
          .filter((b: any) => b.volumeInfo?.title && b.volumeInfo?.imageLinks?.thumbnail)
          .map((book: any): Book => ({
            id: book.id,
            title: book.volumeInfo.title,
            author: book.volumeInfo.authors?.[0] || 'Unknown Author',
            cover: book.volumeInfo.imageLinks.thumbnail,
            link: book.volumeInfo.infoLink || '#'
          }));

        this.startIndex = results.length;
        this.loading = false;
      });
  }

  // Load the next set of books using pagination
  loadMore(): void {
    this.loading = true;

    this.http.get<any>(`${this.apiUrl}/search?q=${encodeURIComponent(this.lastQuery)}&startIndex=${this.startIndex}&maxResults=${this.maxResults}`)
      .subscribe(response => {
        const newResults = response.items || [];

        // Map new results to Book[] and merge with existing list
        const newBooks = newResults
          .filter((b: any) => b.volumeInfo?.title && b.volumeInfo?.imageLinks?.thumbnail)
          .map((book: any): Book => ({
            id: book.id,
            title: book.volumeInfo.title,
            author: book.volumeInfo.authors?.[0] || 'Unknown Author',
            cover: book.volumeInfo.imageLinks.thumbnail,
            link: book.volumeInfo.infoLink || '#'
          }));

        this.books = [...this.books, ...newBooks];
        this.startIndex += this.maxResults;
        this.loading = false;
      });
  }

  // Sort books based on selected field (title or author)
  sortedBooks(): Book[] {
    return this.books.sort((a: Book, b: Book) => a[this.sortBy].localeCompare(b[this.sortBy]));
  }

  // Open book details in a new tab
  openBook(book: Book): void {
    window.open(book.link, '_blank');
  }
}
