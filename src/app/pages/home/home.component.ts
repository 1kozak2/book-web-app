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
      title: 'Structure and Interpretation of Computer Programs',
      author: 'Harold Abelson, Gerald Jay Sussman',
      cover: 'https://covers.openlibrary.org/b/isbn/9780262510875-L.jpg'
    },
    {
      title: 'Functional Programming in Scala',
      author: 'Paul Chiusano, Rúnar Bjarnason',
      cover: 'https://covers.openlibrary.org/b/isbn/9781617290657-L.jpg'
    },
    {
      title: 'Learn You a Haskell for Great Good!',
      author: 'Miran Lipovača',
      cover: 'https://covers.openlibrary.org/b/isbn/9781593272838-L.jpg'
    },
    {
      title: 'Programming Elixir ≥ 1.6',
      author: 'Dave Thomas',
      cover: 'https://covers.openlibrary.org/b/isbn/9781680502992-L.jpg'
    }
  ];
}