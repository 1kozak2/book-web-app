import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.css']
})
export class BookDetailComponent implements OnInit {
  book: any;
  apiUrl = 'http://localhost:3000/api/books';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.get(`${this.apiUrl}/${id}`).subscribe(data => this.book = data);
  }
  getAuthorNames(): string {
    return this.book?.authors?.map((a: { author: { name: string } }) => a.author.name).join(', ') || 'Unknown';
  }
  
  getCategoryNames(): string {
    return this.book?.categories?.map((c: { category: { name: string } }) => c.category.name).join(', ') || 'Uncategorized';
  }
  
  
  addToLibrary(): void {
    // Your logic to POST to backend
  }
  
}
