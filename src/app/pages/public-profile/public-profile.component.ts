import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { UserService } from '../../services/user.service';
import { ShelfService } from '../../services/shelf.service';
import { BookCardComponent } from '../../shared/components/book-card/book-card.component';
import { Shelf } from '../../shared/components/shelf';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, BookCardComponent],
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.css']
})
export class PublicProfileComponent implements OnInit {
  profile: { username: string; shelves: Shelf[] } | null = null;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private shelfService: ShelfService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.userService.getPublicProfile(id).subscribe(p => {
      this.profile = p;
      const requests = p.shelves.map(s => this.shelfService.getSharedShelf(s.shareToken!));
      forkJoin(requests).subscribe(res => {
        res.forEach((shelfData, idx) => {
          p.shelves[idx].books = shelfData.books;
        });
      });
    });
  }
}
