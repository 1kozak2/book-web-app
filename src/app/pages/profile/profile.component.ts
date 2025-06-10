import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LibraryService } from '../../services/library.service';
import { BookCardComponent } from '../../shared/components/book-card/book-card.component';
import { Book } from '../../shared/components/book';


@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule, RouterModule, FormsModule, BookCardComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  username: string | null = null;
  books: Book[] = [];
  categories: string[] = [];
  selectedCategory = '';
  searchTerm = '';

  constructor(private auth: AuthService, private router: Router, private library: LibraryService) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.username = this.auth.getUsername();
    this.loadBooks();
  }

  loadBooks(): void {
    this.library.getMyBooks().subscribe({
      next: books => {
        this.books = books;
        this.categories = Array.from(new Set(books.flatMap(b => b.volumeInfo.categories || [])));
      },
      error: err => console.error('Failed to load books', err)
    });
  }

  filteredBooks(): Book[] {
    return this.books.filter(b => {
      const matchesCategory = this.selectedCategory ? (b.volumeInfo.categories || []).includes(this.selectedCategory) : true;
      const matchesSearch = b.volumeInfo.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
