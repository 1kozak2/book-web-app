
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { LibraryService } from '../../services/library.service';
import { ShelfService } from '../../services/shelf.service';
import { BookCardComponent } from '../../shared/components/book-card/book-card.component';
import { Book } from '../../shared/components/book';
import { Shelf } from '../../shared/components/shelf';


@Component({
  standalone: true,
  selector: 'app-library',
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule, BookCardComponent],
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit {
  username: string | null = null;
  books: Book[] = [];
  categories: string[] = [];
  selectedCategory = '';
  searchTerm = '';
  shelves: Shelf[] = [];
  newShelfName = '';
  showAllShelves = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private library: LibraryService,
    private shelvesService: ShelfService
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.username = this.auth.getUsername();
    this.loadBooks();
    this.loadShelves();
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

  loadShelves(): void {
    this.shelvesService.getShelves().subscribe({
      next: s => (this.shelves = s),
      error: err => console.error('Failed to load shelves', err),
    });
  }

  createShelf(): void {
    if (!this.newShelfName.trim()) return;
    this.shelvesService.createShelf(this.newShelfName).subscribe({
      next: shelf => {
        this.shelves.push(shelf);
        this.newShelfName = '';
      },
      error: err => console.error('Failed to create shelf', err),
    });
  }

  filteredBooks(): Book[] {
    return this.books.filter(b => {
      const matchesCategory = this.selectedCategory ? (b.volumeInfo.categories || []).includes(this.selectedCategory) : true;
      const matchesSearch = b.volumeInfo.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  recentlyAddedBooks(): Book[] {
    return this.filteredBooks().slice().sort((a, b) => {
      const ad = a.addedAt ? new Date(a.addedAt).getTime() : 0;
      const bd = b.addedAt ? new Date(b.addedAt).getTime() : 0;
      return bd - ad;
    });
  }

  shareShelf(shelf: Shelf): void {
    this.shelvesService.generateShareToken(shelf.id).subscribe({
      next: res => {
        shelf.shareToken = res.shareToken;
        shelf.isPublic = true;
        alert(`Share link: ${window.location.origin}/shared/${res.shareToken}`);
      },
      error: err => console.error('Failed to share shelf', err)
    });
  }

}

