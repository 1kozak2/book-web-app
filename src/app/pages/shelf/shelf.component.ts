import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ShelfService } from '../../services/shelf.service';
import { BookCardComponent } from '../../shared/components/book-card/book-card.component';
import { Shelf } from '../../shared/components/shelf';

@Component({
  standalone: true,
  selector: 'app-shelf',
  imports: [CommonModule, BookCardComponent],
  templateUrl: './shelf.component.html',
  styleUrls: ['./shelf.component.css']
})
export class ShelfComponent implements OnInit {
  shelf: Shelf | null = null;

  constructor(private route: ActivatedRoute, private shelfService: ShelfService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.shelfService.getShelf(id).subscribe(s => this.shelf = s);
  }
}
