import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-catalog',
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements OnInit {
  books: any[] = [];
  searchTerm = '';
  sortBy = 'title';
  startIndex = 0;
  maxResults = 20;
  loading = false;
  lastQuery = 'fiction';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.searchTerm = 'fiction';
    this.searchBooks(); // domyślne książki na start
  }

  searchBooks() {
    if (!this.searchTerm.trim()) return;

    this.loading = true;
    this.startIndex = 0;
    this.lastQuery = this.searchTerm;

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(this.searchTerm)}&startIndex=${this.startIndex}&maxResults=${this.maxResults}`;

    this.http.get<any>(url).subscribe(response => {
      this.books = response.items?.map((item: any) => ({
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors?.[0] || 'Nieznany autor',
        cover: item.volumeInfo.imageLinks?.thumbnail || '',
        link: item.volumeInfo.infoLink || '#'
      })) || [];
      this.startIndex += this.maxResults;
      this.loading = false;
    });
  }

  loadMore() {
    this.loading = true;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(this.lastQuery)}&startIndex=${this.startIndex}&maxResults=${this.maxResults}`;

    this.http.get<any>(url).subscribe(response => {
      const newBooks = response.items?.map((item: any) => ({
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors?.[0] || 'Nieznany autor',
        cover: item.volumeInfo.imageLinks?.thumbnail || '',
        link: item.volumeInfo.infoLink || '#'
      })) || [];

      this.books = [...this.books, ...newBooks];
      this.startIndex += this.maxResults;
      this.loading = false;
    });
  }

  sortedBooks() {
    return this.books.sort((a, b) => a[this.sortBy].localeCompare(b[this.sortBy]));
  }

  openBook(book: any) {
    window.open(book.link, '_blank');
  }
}
