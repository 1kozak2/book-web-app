const express = require('express');
const axios = require('axios');
const router = express.Router();

const GOOGLE_BOOKS_API_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const GOOGLE_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

// backend/routes/books.js
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const book = await prisma.book.findUnique({
      where: { id: parseInt(id) },
      include: {
        authors: { include: { author: true } },
        categories: { include: { category: true } }
      }
    });

    if (!book) return res.status(404).json({ error: 'Book not found' });

    res.json(book);
  } catch (error) {
    console.error('Error fetching book:', error.message);
    res.status(500).json({ error: 'Failed to fetch book details' });
  }
});

// General search from Google Books API
router.get('/search', async (req, res) => {
  const { q, startIndex = 0, maxResults = 20 } = req.query;

  if (!q) return res.status(400).json({ error: 'Missing search query (q)' });

  try {
    const response = await axios.get(GOOGLE_BOOKS_API_BASE_URL, {
      params: {
        q,
        startIndex,
        maxResults,
        key: GOOGLE_API_KEY
      }
    });

    res.json({ items: response.data.items || [] });

  } catch (error) {
    console.error('Google Books API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch from Google Books API' });
  }
});

// Featured books (you can define a query term like "bestsellers", "trending", etc.)
router.get('/featured', async (req, res) => {
  try {
    const response = await axios.get(GOOGLE_BOOKS_API_BASE_URL, {
      params: {
        q: 'featured',
        maxResults: 10,
        key: GOOGLE_API_KEY
      }
    });

    res.json(response.data.items || []);
  } catch (error) {
    console.error('Error fetching featured books:', error.message);
    res.status(500).json({ error: 'Failed to fetch featured books' });
  }
});
module.exports = router;
