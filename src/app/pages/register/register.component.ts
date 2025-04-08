import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  fullName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(private router: Router) {}

  onRegister(): void {
    if (this.password !== this.confirmPassword) {
      alert('Hasła nie są takie same.');
      return;
    }

    // Replace with actual registration logic
    console.log('Registering:', this.fullName, this.email);
    this.router.navigate(['/login']); // Redirect to login after successful registration
  }
}
