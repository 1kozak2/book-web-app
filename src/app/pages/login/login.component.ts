import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule,RouterModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onLogin(): void {
    const loginData = {
      email: this.email,
      password: this.password
    };

    this.http.post<any>('http://localhost:3000/api/auth/login', loginData).subscribe({
      next: (response) => {
        // Store JWT token in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        // Redirect to homepage or dashboard
        this.router.navigate(['/profile']);
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Login failed. Please try again.';
        console.error('Login error:', error);
      }
    });
  }
}
