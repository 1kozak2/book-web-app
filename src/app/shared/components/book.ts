export interface Book {
    id: string;
    volumeInfo: {
      title: string;
      subtitle?: string;
      description?: string;
      publishedDate?: string;
      pageCount?: number;
      language?: string;
      averageRating?: number;
      ratingsCount?: number;
      authors?: string[];
      categories?: string[];
      imageLinks?: {
        thumbnail?: string;
      };
      infoLink?: string;
    };
  }
  