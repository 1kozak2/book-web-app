import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  books = [
    {
      title: 'Władca Pierścieni',
      author: 'J.R.R. Tolkien',
      cover: 'https://covers.openlibrary.org/b/id/8231856-L.jpg'
    },
    {
      title: 'Harry Potter',
      author: 'J.K. Rowling',
      cover: 'https://covers.openlibrary.org/b/id/7884861-L.jpg'
    },
    {
      title: '1984',
      author: 'George Orwell',
      cover: 'https://covers.openlibrary.org/b/id/7222246-L.jpg'
    },
    {
      title: 'Zbrodnia i kara',
      author: 'Fiodor Dostojewski',
      cover: 'https://covers.openlibrary.org/b/id/11153291-L.jpg'
    }
  ];
}