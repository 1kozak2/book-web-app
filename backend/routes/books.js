const express = require('express');
const prisma = require('../prisma');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();


router.get('/search', async (req, res) => {
  const { q, startIndex = 0, maxResults = 20 } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Missing search query (q)' });
  }

  try {
    const response = await axios.get(GOOGLE_BOOKS_API_BASE_URL, {
      params: {
        q,
        startIndex,
        maxResults,
        key: GOOGLE_API_KEY,
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching from Google Books API:', error.message);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});
// Add a Book
router.post('/', authenticateToken, async (req, res) => {
  const {
    googleBooksId, title, subtitle, description, publishedDate,
    pageCount, language, thumbnailUrl, previewLink, infoLink,
    averageRating, ratingsCount, isbn10, isbn13
  } = req.body;

  try {
    const book = await prisma.book.create({
      data: {
        googleBooksId,
        title,
        subtitle,
        description,
        publishedDate: publishedDate ? new Date(publishedDate) : null,
        pageCount,
        language,
        thumbnailUrl,
        previewLink,
        infoLink,
        averageRating,
        ratingsCount,
        isbn10,
        isbn13
      }
    });
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: 'Could not add book' });
  }
});

// Initial Books endpoint
router.get('/initBooks', async (req, res) => {
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

module.exports = router;
