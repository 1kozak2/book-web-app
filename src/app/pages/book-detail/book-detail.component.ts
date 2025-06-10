import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Book } from '../../shared/components/book';
import { LibraryService } from '../../services/library.service';
import { ShelfService } from '../../services/shelf.service';
import { ReviewService } from '../../services/review.service';

import { Shelf } from '../../shared/components/shelf';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.css']
})
export class BookDetailComponent implements OnInit {
  book: Book | undefined;
  apiUrl = 'http://localhost:3000/api/books';

  shelves: Shelf[] = [];
  
  selectedShelfId: number | null = null;
  showDialog = false;
  reviews: any[] = [];
  reviewText = '';
  reviewRating: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private library: LibraryService,
    private shelfService: ShelfService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    const googleBooksId = this.route.snapshot.paramMap.get('id');
    this.http.get<Book>(`${this.apiUrl}/google/${googleBooksId}`).subscribe(data => {
      this.book = data;
    });
    this.shelfService.getShelves().subscribe({
      next: s => (this.shelves = s),
      error: err => console.error('Failed to load shelves', err),
    });
    if (googleBooksId) {
      this.reviewService.getReviews(googleBooksId).subscribe(r => this.reviews = r);
    }
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
    this.showDialog = true;
  }

  confirmAdd(): void {
    if (!this.book || !this.selectedShelfId) return;
    const payload = {
      googleBooksId: this.book.id,
      title: this.book.volumeInfo.title,
      subtitle: this.book.volumeInfo.subtitle,
      description: this.book.volumeInfo.description,
      publishedDate: this.book.volumeInfo.publishedDate,
      pageCount: this.book.volumeInfo.pageCount,
      language: this.book.volumeInfo.language,
      thumbnailUrl: this.book.volumeInfo.imageLinks?.thumbnail,
      previewLink: '',
      infoLink: this.book.volumeInfo.infoLink,
      averageRating: this.book.volumeInfo.averageRating,
      ratingsCount: this.book.volumeInfo.ratingsCount,
      isbn10: '',
      isbn13: '',
      authors: this.book.volumeInfo.authors,
      categories: this.book.volumeInfo.categories,
    };
    this.shelfService.addBookToShelf(this.selectedShelfId, payload).subscribe({
      next: () => {
        this.showDialog = false;
        alert('Book added to shelf!');
      },
      error: err => alert('Failed to add book: ' + err.message),
    });
  }

  cancelAdd(): void {
    this.showDialog = false;
  }

  addReview(): void {
    if (!this.book) return;
    this.reviewService.addReview(this.book.id, this.reviewRating || 0, this.reviewText, this.book).subscribe({
      next: r => { this.reviews.unshift(r); this.reviewText = ''; this.reviewRating = null; },
      error: () => alert('Failed to add review')
    });
  }
}
