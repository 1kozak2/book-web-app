import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<string | null>(null);
  user$ = this.userSubject.asObservable();
  private readonly API = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('username');
    if (storedUser) this.userSubject.next(storedUser);
  }

  login(email: string, password: string) {
  return this.http.post<{ token: string; user: { username: string; email: string; id: number } }>(
    `${this.API}/login`,
    { email, password }
  ).pipe(
    tap(res => {
      localStorage.setItem('token', res.token);
      localStorage.setItem('username', res.user.username);  // ✅ FIXED
      localStorage.setItem('user', JSON.stringify(res.user)); // optional: store whole user
      this.userSubject.next(res.user.username);
    })
  );
}
  register(username: string, email: string, password: string) {
    return this.http.post(`${this.API}/register`, { username, email, password });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
