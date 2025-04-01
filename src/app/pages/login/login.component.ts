import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule],
  template: '<h2 style="padding: 2rem;">Logowanie 🧑‍💻</h2>',
})
export class LoginComponent {}