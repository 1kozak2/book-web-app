import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  username: string | null = null;
  newUsername = '';
  preferencesText = '';

  constructor(private auth: AuthService, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.username = this.auth.getUsername();
  }

  save(): void {
    const payload: any = {};
    if (this.newUsername) payload.username = this.newUsername;
    try { payload.preferences = JSON.parse(this.preferencesText || '{}'); } catch { payload.preferences = {}; }
    this.http.put<any>('http://localhost:3000/api/me', payload).subscribe({
      next: user => {
        this.username = user.username;
        localStorage.setItem('username', user.username);
        this.newUsername = '';
        alert('Profile updated');
      },
      error: err => alert('Failed to update profile')
    });
  }

}
