import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Book } from '../../shared/components/book';
import { LibraryService } from '../../services/library.service';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.css']
})
export class BookDetailComponent implements OnInit {
  book: Book | undefined;
  apiUrl = 'http://localhost:3000/api/books';
  constructor(private route: ActivatedRoute, private http: HttpClient, private library: LibraryService) {}

  ngOnInit(): void {
    const googleBooksId = this.route.snapshot.paramMap.get('id');
    this.http.get<Book>(`${this.apiUrl}/google/${googleBooksId}`).subscribe(data => {
      this.book = data;
    });
  }

  getAuthorNames(): string {
    return this.book?.volumeInfo?.authors?.join(', ') || 'Unknown';
  }

  getCategoryNames(): string {
    return this.book?.volumeInfo?.categories?.join(', ') || 'Uncategorized';
  }

  getThumbnail(): string {
    return this.book?.volumeInfo?.imageLinks?.thumbnail || '';
  }

  getInfoLink(): string {
    return this.book?.volumeInfo?.infoLink || '#';
  }

  addToLibrary(): void {
    if (!this.book) return;

    const payload = {
      googleBooksId: this.book.id,
      title: this.book.volumeInfo.title,
      subtitle: this.book.volumeInfo.subtitle,
      description: this.book.volumeInfo.description,
      publishedDate: this.book.volumeInfo.publishedDate,
      pageCount: this.book.volumeInfo.pageCount,
      language: this.book.volumeInfo.language,
      thumbnailUrl: this.book.volumeInfo.imageLinks?.thumbnail,
      previewLink: '', // Not provided by API response
      infoLink: this.book.volumeInfo.infoLink,
      averageRating: this.book.volumeInfo.averageRating,
      ratingsCount: this.book.volumeInfo.ratingsCount,
      isbn10: '',
      isbn13: ''
    };

    this.library.addBook(payload).subscribe({
      next: () => alert('Book added to your library!'),
      error: err => alert('Failed to add book: ' + err.message)
    });
  }
}
