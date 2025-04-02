import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'katalog', component: CatalogComponent },
  { path: 'logowanie', component: LoginComponent },
  { path: 'rejestracja', component: RegisterComponent }
];
