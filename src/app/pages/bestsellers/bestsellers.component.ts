import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Book } from '../../shared/components/book';
import { BookCardComponent } from '../../shared/components/book-card/book-card.component';

@Component({
  standalone: true,
  selector: 'app-bestsellers',
  imports: [CommonModule, HttpClientModule, BookCardComponent],
  templateUrl: './bestsellers.component.html',
  styleUrls: ['./bestsellers.component.css']
})
export class BestsellersComponent implements OnInit {
  books: Book[] = [];
  loading = false;
  apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.searchBooks();
  }

  // fetchBestsellers(): void {
  //   this.loading = true;
  //   this.http.get<any>(`${this.apiUrl}/api/books/featured`).subscribe(
  //     response => {
  //       this.books = (response || []).map((b: any): Book => ({
  //         id: b.id,
  //         title: b.volumeInfo.title,
  //         author: b.volumeInfo.authors?.[0] || 'Unknown Author',
  //         cover: b.volumeInfo.imageLinks?.thumbnail,
  //         link: b.volumeInfo.infoLink || '#'
  //       }));
  //       this.loading = false;
  //     },
  //     err => {
  //       console.error('Failed to load bestsellers:', err);
  //       this.loading = false;
  //     }
  //   );
  // }
searchBooks(): void {
    
    this.loading = true;

     this.http.get<any>(`${this.apiUrl}/api/books/featured`)
      .subscribe(response => {
        const rawItems = Array.isArray(response) ? response : response.items || [];
        this.books = this.mapToBooks(rawItems);
        this.loading = false;
      });
  
    }
  
     mapToBooks(raw: any[]): Book[] {
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

