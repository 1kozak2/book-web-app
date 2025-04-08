const express = require('express');
const prisma = require('../prisma');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

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

module.exports = router;
