const express = require('express');
const axios = require('axios');
const cors = require('cors');  // <-- add CORS middleware if needed
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Allow cross-origin requests

const GOOGLE_BOOKS_API_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

// Search endpoint
app.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }
    const response = await axios.get(GOOGLE_BOOKS_API_BASE_URL, {
      params: {
        q,
        maxResults: 10,
        key: process.env.GOOGLE_BOOKS_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initial Books endpoint
app.get('/api/initBooks', async (req, res) => {
  try {
    const defaultQuery = 'fiction';
    const response = await axios.get(GOOGLE_BOOKS_API_BASE_URL, {
      params: {
        q: defaultQuery,
        maxResults: 20,
        key: process.env.GOOGLE_BOOKS_API_KEY
      }
    });

    const books = response.data.items || [];

    // Normalize and clean up the book data
    const booksWithImages = books
      .filter(book =>
        book.volumeInfo &&
        book.volumeInfo.title &&
        book.volumeInfo.imageLinks &&
        book.volumeInfo.imageLinks.thumbnail
      )
      .map(book => ({
        id: book.id,
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors || [],
        thumbnail: book.volumeInfo.imageLinks.thumbnail
      }));

    res.json(booksWithImages);
  } catch (error) {
    console.error('Error fetching books:', error.message);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});


// Start the server after all routes are defined
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
