export interface Shelf {
  id: number;
  name: string;
  books: import('./book').Book[];
}
