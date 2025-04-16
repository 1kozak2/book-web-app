import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Book } from '../../shared/components/book';

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

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

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
    // TODO: Implement add-to-library logic here
  }
}
