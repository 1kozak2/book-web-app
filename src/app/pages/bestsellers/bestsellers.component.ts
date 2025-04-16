import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  link: string;
}

@Component({
  standalone: true,
  selector: 'app-bestsellers',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './bestsellers.component.html',
  styleUrls: ['./bestsellers.component.css']
})
export class BestsellersComponent implements OnInit {
  books: Book[] = [];
  loading = false;
  apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchBestsellers();
  }

  fetchBestsellers(): void {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/api/books/featured`).subscribe(
      response => {
        this.books = (response || []).map((b: any): Book => ({
          id: b.id,
          title: b.volumeInfo.title,
          author: b.volumeInfo.authors?.[0] || 'Unknown Author',
          cover: b.volumeInfo.imageLinks?.thumbnail,
          link: b.volumeInfo.infoLink || '#'
        }));
        this.loading = false;
      },
      err => {
        console.error('Failed to load bestsellers:', err);
        this.loading = false;
      }
    );
  }

  openBook(book: Book): void {
    window.open(book.link, '_blank');
  }
}
