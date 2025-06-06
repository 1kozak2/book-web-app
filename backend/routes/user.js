const express = require('express');
const prisma = require('../prisma');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();
const { serializeUser } = require('../utils/serializer');
// POST /api/user/books - Add book to logged-in user's library
router.post('user/books', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const {
    googleBooksId,
    title,
    subtitle,
    description,
    publishedDate,
    pageCount,
    language,
    thumbnailUrl,
    previewLink,
    infoLink,
    averageRating,
    ratingsCount,
    isbn10,
    isbn13,
    authors,
    categories
  } = req.body;

  try {
    // Check if book exists
    let book = await prisma.book.findUnique({
      where: { googleBooksId }
    });

    // Create book if not exists
    if (!book) {
      book = await prisma.book.create({
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

      // Link authors
      for (const name of authors || []) {
        const author = await prisma.author.upsert({
          where: { name },
          update: {},
          create: { name }
        });
        await prisma.bookAuthor.create({
          data: {
            bookId: book.id,
            authorId: author.id
          }
        });
      }

      // Link categories
      for (const name of categories || []) {
        const category = await prisma.category.upsert({
          where: { name },
          update: {},
          create: { name }
        });
        await prisma.bookCategory.create({
          data: {
            bookId: book.id,
            categoryId: category.id
          }
        });
      }
    }

    // Link book to user
    await prisma.userBook.upsert({
      where: {
        userId_bookId: {
          userId,
          bookId: book.id
        }
      },
      update: {},
      create: {
        userId,
        bookId: book.id,
        status: 'added'
      }
    });

    res.status(201).json({ message: 'Book added to library', book });
  } catch (error) {
    console.error('Add Book Error:', error);
    res.status(500).json({ error: 'Failed to add book to user library' });
  }
});

module.exports = router;




router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const serialized = serializeUser(user);
    res.json(serialized);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;