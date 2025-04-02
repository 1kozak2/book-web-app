

// const express = require('express');
// const mysql = require('mysql2');
// const cors = require('cors');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
// const cron = require('node-cron');
// const app = express();
// app.use(cors());
// app.use(express.json());

// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'manager',
//   password: 'manager_password',
//   database: 'kozak'
// });

// connection.connect((err) => {
//   if (err) {
//     console.error('Error connecting to database:', err);
//     return;
//   }
//   console.log('Successfully connected to database');
// });
// const JWT_SECRET = 'your-secret-key';
// // JWT Verification Middleware
// const verifyToken = (req, res, next) => {
//   const bearerHeader = req.headers['authorization'];

//   if (!bearerHeader) {
//     return res.status(401).json({ message: 'No token provided' });
//   }

//   const token = bearerHeader.split(' ')[1];

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: 'Invalid token' });
//   }
// };

// // Role-based Access Control Middleware
// const checkRole = (allowedRoles) => {
//   return (req, res, next) => {
//     if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
//       return res.status(403).json({ message: 'Access denied' });
//     }
//     next();
//   };
// };
// cron.schedule('0 0 * * *', async () => {
//   try {
//     const response = await fetch('http://localhost:3001/api/bookings/cleanup', {
//       method: 'POST'
//     });
//     const result = await response.json();
//     console.log('Room status cleanup result:', result);
//   } catch (error) {
//     console.error('Room status cleanup failed:', error);
//   }
// });
// // Authentication
// app.post('/api/auth/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Check in Klient zalogowany table
//     const [clients] = await connection.promise().query(
//       'SELECT * FROM `Klient zalogowany` WHERE Email = ?',
//       [email]
//     );

//     if (clients.length > 0) {
//       // For now, simple password check (you should use bcrypt in production)
//       if (clients[0].Haslo === password) {
//         const token = jwt.sign(
//           { 
//             id: clients[0].ID, 
//             role: 'client',
//             email: clients[0].Email 
//           },
//           JWT_SECRET,
//           { expiresIn: '24h' }
//         );

//         return res.json({ 
//           token,
//           user: {
//             id: clients[0].ID,
//             email: clients[0].Email,
//             role: 'client'
//           }
//         });
//       }
//     }

//     // Check in Pracownik table
//     const [employees] = await connection.promise().query(
//       'SELECT * FROM Pracownik WHERE Email = ?',
//       [email]
//     );

//     if (employees.length > 0) {
//       if (employees[0].Haslo === password) {
//         // Determine employee role
//         const [roles] = await connection.promise().query(`
//           SELECT 
//             CASE 
//               WHEN m.PracownikID IS NOT NULL THEN 'manager'
//               WHEN r.PracownikID IS NOT NULL THEN 'receptionist'
//               WHEN s.PracownikID IS NOT NULL THEN 'cleaner'
//             END as role
//           FROM Pracownik p
//           LEFT JOIN Manager m ON p.ID = m.PracownikID
//           LEFT JOIN Recepcjonista r ON p.ID = r.PracownikID
//           LEFT JOIN Sprzataczka s ON p.ID = s.PracownikID
//           WHERE p.ID = ?
//         `, [employees[0].ID]);

//         const token = jwt.sign(
//           { 
//             id: employees[0].ID, 
//             role: roles[0].role,
//             email: employees[0].Email 
//           },
//           JWT_SECRET,
//           { expiresIn: '24h' }
//         );

//         return res.json({ 
//           token,
//           user: {
//             id: employees[0].ID,
//             email: employees[0].Email,
//             role: roles[0].role
//           }
//         });
//       }
//     }

//     res.status(401).json({ message: 'Invalid credentials' });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });
// app.post('/api/auth/register', async (req, res) => {
//   const { firstName, lastName, email, phone, password } = req.body;

//   try {
//     // Check if email already exists
//     const [existingUsers] = await connection.promise().query(
//       'SELECT ID FROM `Klient zalogowany` WHERE Email = ?',
//       [email]
//     );

//     if (existingUsers.length > 0) {
//       return res.status(400).json({ 
//         message: 'Użytkownik z tym adresem email już istnieje' 
//       });
//     }

  

//     // Insert new user
//     const [result] = await connection.promise().query(
//       'INSERT INTO `Klient zalogowany` (Imie, Nazwisko, Email, Numer_telefonu, Haslo) VALUES (?, ?, ?, ?, ?)',
//       [firstName, lastName, email, phone, password]
//     );

//     res.status(201).json({ 
//       message: 'Rejestracja przebiegła pomyślnie',
//       userId: result.insertId 
//     });
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({ 
//       message: 'Wystąpił błąd podczas rejestracji' 
//     });
//   }
// });
// // Room Management
// app.get('/api/rooms', (req, res) => {
//   const query = `
//     SELECT p.*, k.KlasaPokoju, k.Cena, k.LiczbaOsob 
//     FROM Pokoj p
//     JOIN Klasa k ON p.KlasaKlasaPokoju = k.KlasaPokoju`;
    
//   connection.query(query, (error, results) => {
//     if (error) return res.status(500).json({ message: 'Server error' });
//     res.json(results);
//   });
// });

// // Room Availability Check
// app.get('/api/availability', async (req, res) => {
//   const { roomId, checkIn, checkOut } = req.query;
  
//   const query = `
//     SELECT * FROM Rezerwacje 
//     WHERE PokojID = ? 
//     AND NOT (Termin_wymeldowania <= ? OR Termin_rezerwacji >= ?)`;

//   try {
//     const [bookings] = await connection.promise().query(query, [roomId, checkIn, checkOut]);
//     res.json(bookings.length === 0);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Booking Creation
// app.post('/api/bookings', async (req, res) => {
//   try {
//     const {
//       clientId,  // Get clientId from request body
//       roomClass,
//       checkIn,
//       checkOut,
//       firstName,
//       lastName,
//       email,
//       phone,
//       guestCount,
//       mealPlan,
//       specialRequests,
//       totalPrice
//     } = req.body;
//     if (!clientId) {
//       return res.status(400).json({ message: 'Client ID is required' });
//     }
//     // Start transaction
//     const [client] = await connection.promise().query(
//       'SELECT ID FROM `Klient zalogowany` WHERE ID = ?',
//       [clientId]
//     );
//     if (client.length === 0) {
//       throw new Error('Invalid client ID');
//     }
//     await connection.promise().beginTransaction();

//     // Generate unique booking ID (timestamp + random number)
//     const uniqueBookingId = Math.floor(Math.random() * 100);

//     // Find available room of requested class
//     const [availableRooms] = await connection.promise().query(`
//       SELECT p.ID, p.Numer
//       FROM Pokoj p
//       JOIN Klasa k ON p.KlasaKlasaPokoju = k.KlasaPokoju
//       WHERE k.KlasaPokoju = ?
//       AND p.Status = 'Wolny'
//       AND p.ID NOT IN (
//         SELECT PokojID 
//         FROM Rezerwacje 
//         WHERE (Termin_rezerwacji <= ? AND Termin_wymeldowania >= ?)
//       )
//       LIMIT 1
//     `, [roomClass, checkOut, checkIn]);

//     if (availableRooms.length === 0) {
//       throw new Error('Brak dostępnych pokoi w wybranej klasie na podany termin');
//     }

//     const roomId = availableRooms[0].ID;
//     const roomNumber = availableRooms[0].Numer;

//     // Update room status to 'Zajety'
//     await connection.promise().query(
//       'UPDATE Pokoj SET Status = ? WHERE ID = ?',
//       ['Zajety', roomId]
//     );

//     // Create payment record
//     const [paymentResult] = await connection.promise().query(
//       'INSERT INTO Payment (PaymentDate, Amount, Method) VALUES (NOW(), ?, "Online")',
//       [totalPrice]
//     );

//     // Create booking
//     const [bookingResult] = await connection.promise().query(
//       `INSERT INTO Rezerwacje (
//         ID,
//         Termin_rezerwacji, 
//         Termin_wymeldowania, 
//         Wyzywienie, 
//         DoZaplaty, 
//         PokojID, 
//         \`Klient zalogowanyID\`,
//         PaymentPayment_ID
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         uniqueBookingId,
//         checkIn,
//         checkOut,
//         mealPlan,
//         totalPrice,
//         roomId,
//         clientId, 
//         paymentResult.insertId
//       ]
//     );

//     // Schedule room status update after checkout
//     const checkoutDate = new Date(checkOut);
//     setTimeout(async () => {
//       try {
//         await connection.promise().query(
//           'UPDATE Pokoj SET Status = ? WHERE ID = ?',
//           ['Wolny', roomId]
//         );
//       } catch (error) {
//         console.error('Error updating room status after checkout:', error);
//       }
//     }, checkoutDate.getTime() - Date.now());

//     await connection.promise().commit();

//     res.status(201).json({
//       message: 'Rezerwacja została utworzona',
//       bookingId: uniqueBookingId,
//       roomNumber: roomNumber,
//       checkIn: checkIn,
//       checkOut: checkOut
//     });

//   } catch (error) {
//     await connection.promise().rollback();
//     console.error('Booking error:', error);
//     res.status(500).json({ 
//       message: error.message || 'Wystąpił błąd podczas tworzenia rezerwacji' 
//     });
//   }
// });

// // Add an endpoint to check room status
// app.get('/api/rooms/status', async (req, res) => {
//   try {
//     const [rooms] = await connection.promise().query(`
//       SELECT p.Numer, p.Status, k.KlasaPokoju
//       FROM Pokoj p
//       JOIN Klasa k ON p.KlasaKlasaPokoju = k.KlasaPokoju
//       ORDER BY p.Numer
//     `);
//     res.json(rooms);
//   } catch (error) {
//     console.error('Error fetching room status:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Add an endpoint to clear expired bookings and update room status
// app.post('/api/bookings/cleanup', async (req, res) => {
//   try {
//     // Get expired bookings
//     const [expiredBookings] = await connection.promise().query(`
//       SELECT PokojID
//       FROM Rezerwacje
//       WHERE Termin_wymeldowania < CURRENT_DATE
//     `);

//     // Update room status for expired bookings
//     for (const booking of expiredBookings) {
//       await connection.promise().query(
//         'UPDATE Pokoj SET Status = ? WHERE ID = ?',
//         ['Wolny', booking.PokojID]
//       );
//     }

//     res.json({ message: 'Room status cleanup completed' });
//   } catch (error) {
//     console.error('Error cleaning up room status:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });
// // app.get('/api/test', (req, res) => {
// //   // Test query to check multiple tables
// //   const query = `
// //     SELECT 
// //       (SELECT COUNT(*) FROM \`Klient zalogowany\`) as total_clients,
// //       (SELECT COUNT(*) FROM Pokoj) as total_rooms,
// //       (SELECT COUNT(*) FROM Pracownik) as total_employees,
// //       (SELECT COUNT(*) FROM Rezerwacje) as total_bookings,
// //       (SELECT KlasaPokoju FROM Klasa LIMIT 1) as sample_room_class,
// //       (SELECT Status FROM Pokoj LIMIT 1) as sample_room_status,
// //       (SELECT GROUP_CONCAT(DISTINCT Status) FROM Pokoj) as all_room_statuses;
// //   `;

// //   connection.query(query, (error, results) => {
// //     if (error) {
// //       console.error('Database error:', error);
// //       return res.status(500).json({ 
// //         error: 'Database connection failed',
// //         details: error.message 
// //       });
// //     }

// //     // Test specific room details
// //     connection.query('SELECT * FROM Pokoj LIMIT 3', (roomError, roomResults) => {
// //       if (roomError) {
// //         console.error('Room query error:', roomError);
// //         return res.status(500).json({ 
// //           error: 'Room query failed',
// //           details: roomError.message 
// //         });
// //       }

// //       res.json({ 
// //         message: 'Server and database connection successful',
// //         dbStatus: 'Connected',
// //         statistics: results[0],
// //         sampleRooms: roomResults,
// //         timestamp: new Date().toISOString()
// //       });
// //     });
// //   });
// // });
// app.get('/api/bookings/user/:userId', async (req, res) => {
//   try {
//     const userId = req.params.userId;
    
//     const [bookings] = await connection.promise().query(`
//       SELECT 
//         r.ID,
//         r.Termin_rezerwacji,
//         r.Termin_wymeldowania,
//         r.Wyzywienie,
//         r.DoZaplaty,
//         p.Numer as roomNumber,
//         k.KlasaPokoju as roomClass
//       FROM Rezerwacje r
//       JOIN Pokoj p ON r.PokojID = p.ID
//       JOIN Klasa k ON p.KlasaKlasaPokoju = k.KlasaPokoju
//       WHERE r.Klient_zalogowanyID = ?
//       ORDER BY r.Termin_rezerwacji DESC
//     `, [userId]);

//     res.json(bookings);
//   } catch (error) {
//     console.error('Error fetching user bookings:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });
// // Add a specific test endpoint for room availability
// app.get('/api/test/rooms', (req, res) => {
//   const query = `
//     SELECT 
//       p.ID,
//       p.Numer as RoomNumber,
//       p.Status,
//       k.KlasaPokoju as RoomClass,
//       k.Cena as Price,
//       k.LiczbaOsob as Capacity,
//       CASE 
//         WHEN r.ID IS NULL THEN 'Available'
//         ELSE 'Booked'
//       END as Availability
//     FROM Pokoj p
//     JOIN Klasa k ON p.KlasaKlasaPokoju = k.KlasaPokoju
//     LEFT JOIN Rezerwacje r ON p.ID = r.PokojID
//     AND CURRENT_DATE BETWEEN r.Termin_rezerwacji AND r.Termin_wymeldowania
//     LIMIT 5
//   `;

//   connection.query(query, (error, results) => {
//     if (error) {
//       console.error('Room test query error:', error);
//       return res.status(500).json({ 
//         error: 'Room query failed',
//         details: error.message 
//       });
//     }

//     res.json({
//       message: 'Room data retrieved successfully',
//       rooms: results,
//       queryTime: new Date().toISOString()
//     });
//   });
// });



// // Test endpoint for current bookings
// app.get('/api/test/bookings', (req, res) => {
//   const query = `
//     SELECT 
//       r.ID as BookingID,
//       r.Termin_rezerwacji as CheckIn,
//       r.Termin_wymeldowania as CheckOut,
//       r.Wyzywienie as MealPlan,
//       r.DoZaplaty as TotalPrice,
//       k.Imie as ClientFirstName,
//       k.Nazwisko as ClientLastName,
//       p.Numer as RoomNumber,
//       kl.KlasaPokoju as RoomClass
//     FROM Rezerwacje r
//     JOIN \`Klient zalogowany\` k ON r.Klient_zalogowanyID = k.ID
//     JOIN Pokoj p ON r.PokojID = p.ID
//     JOIN Klasa kl ON p.KlasaKlasaPokoju = kl.KlasaPokoju
//     WHERE r.Termin_wymeldowania >= CURRENT_DATE
//     LIMIT 5
//   `;

//   connection.query(query, (error, results) => {
//     if (error) {
//       console.error('Booking test query error:', error);
//       return res.status(500).json({ 
//         error: 'Booking query failed',
//         details: error.message 
//       });
//     }

//     res.json({
//       message: 'Booking data retrieved successfully',
//       bookings: results,
//       queryTime: new Date().toISOString()
//     });
//   });
// });
// // Staff Management (Manager only)
// app.get('/api/employees', verifyToken, async (req, res) => {
//   if (req.user.role !== 'manager') {
//     return res.status(403).json({ message: 'Unauthorized' });
//   }

//   try {
//     const [employees] = await connection.promise().query(`
//       SELECT 
//         p.*,
//         CASE 
//           WHEN m.PracownikID IS NOT NULL THEN 'manager'
//           WHEN r.PracownikID IS NOT NULL THEN 'receptionist'
//           WHEN s.PracownikID IS NOT NULL THEN 'cleaner'
//         END as role
//       FROM Pracownik p
//       LEFT JOIN Manager m ON p.ID = m.PracownikID
//       LEFT JOIN Recepcjonista r ON p.ID = r.PracownikID
//       LEFT JOIN Sprzataczka s ON p.ID = s.PracownikID
//     `);

//     res.json(employees);
//   } catch (error) {
//     console.error('Error fetching employees:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Create employee
// app.post('/api/employees', verifyToken, async (req, res) => {
//   if (req.user.role !== 'manager') {
//     return res.status(403).json({ message: 'Unauthorized' });
//   }

//   const { firstName, lastName, email, pesel, address, phone, role, password } = req.body;

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const [result] = await connection.promise().query(
//       'INSERT INTO Pracownik (Imie, Nazwisko, PESEL, Adres, Numer_telefonu, Email, Haslo) VALUES (?, ?, ?, ?, ?, ?, ?)',
//       [firstName, lastName, pesel, address, phone, email, hashedPassword]
//     );

//     const employeeId = result.insertId;

//     // Insert into role-specific table
//     const roleTable = role === 'manager' ? 'Manager' : 
//                      role === 'receptionist' ? 'Recepcjonista' : 
//                      'Sprzataczka';

//     await connection.promise().query(
//       `INSERT INTO ${roleTable} (PracownikID, dataZatrudnienia) VALUES (?, NOW())`,
//       [employeeId]
//     );

//     res.status(201).json({ message: 'Employee created successfully' });
//   } catch (error) {
//     console.error('Error creating employee:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// app.delete('/api/employees/:id', verifyToken, async (req, res) => {
//   if (req.user.role !== 'manager') {
//     return res.status(403).json({ message: 'Unauthorized' });
//   }

//   const employeeId = req.params.id;

//   try {
//     await connection.promise().beginTransaction();

//     // Delete from role-specific tables first
//     await connection.promise().query('DELETE FROM Manager WHERE PracownikID = ?', [employeeId]);
//     await connection.promise().query('DELETE FROM Recepcjonista WHERE PracownikID = ?', [employeeId]);
//     await connection.promise().query('DELETE FROM Sprzataczka WHERE PracownikID = ?', [employeeId]);

//     // Then delete from main employee table
//     await connection.promise().query('DELETE FROM Pracownik WHERE ID = ?', [employeeId]);

//     await connection.promise().commit();
//     res.json({ message: 'Employee deleted successfully' });
//   } catch (error) {
//     await connection.promise().rollback();
//     console.error('Error deleting employee:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });


// const PORT = 3001;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
// app.post('/api/auth/login', async (req, res) => {
//   const { email, password } = req.body;
  
//   try {
//     // First check Klient zalogowany table
//     const [clients] = await connection.promise().query(
//       'SELECT * FROM `Klient zalogowany` WHERE Email = ?',
//       [email]
//     );

//     if (clients.length > 0) {
//       const client = clients[0];
//       const validPassword = await bcrypt.compare(password, client.Haslo);
      
//       if (validPassword) {
//         const token = jwt.sign(
//           { id: client.ID, role: 'client' },
//           'your_jwt_secret',
//           { expiresIn: '24h' }
//         );
        
//         return res.json({
//           user: {
//             id: client.ID,
//             email: client.Email,
//             firstName: client.Imie,
//             lastName: client.Nazwisko,
//             role: 'client'
//           },
//           token
//         });
//       }
//     }

//     // Then check Pracownik table
//     const [employees] = await connection.promise().query(
//       `SELECT p.*, 
//         CASE 
//           WHEN m.PracownikID IS NOT NULL THEN 'manager'
//           WHEN r.PracownikID IS NOT NULL THEN 'receptionist'
//           WHEN s.PracownikID IS NOT NULL THEN 'cleaner'
//         END as role
//       FROM Pracownik p
//       LEFT JOIN Manager m ON p.ID = m.PracownikID
//       LEFT JOIN Recepcjonista r ON p.ID = r.PracownikID
//       LEFT JOIN Sprzataczka s ON p.ID = s.PracownikID
//       WHERE p.Email = ?`,
//       [email]
//     );

//     if (employees.length > 0) {
//       const employee = employees[0];
//       const validPassword = await bcrypt.compare(password, employee.Haslo);
      
//       if (validPassword) {
//         const token = jwt.sign(
//           { id: employee.ID, role: employee.role },
//           'your_jwt_secret',
//           { expiresIn: '24h' }
//         );
        
//         return res.json({
//           user: {
//             id: employee.ID,
//             email: employee.Email,
//             firstName: employee.Imie,
//             lastName: employee.Nazwisko,
//             role: employee.role
//           },
//           token
//         });
//       }
//     }

//     res.status(401).json({ message: 'Invalid credentials' });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Register endpoint (for clients only)
// app.post('/api/auth/register', async (req, res) => {
//   const { email, password, firstName, lastName, phone } = req.body;
  
//   try {
//     // Check if email already exists
//     const [existing] = await connection.promise().query(
//       'SELECT ID FROM `Klient zalogowany` WHERE Email = ?',
//       [email]
//     );

//     if (existing.length > 0) {
//       return res.status(400).json({ message: 'Email already registered' });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Insert new client
//     const [result] = await connection.promise().query(
//       'INSERT INTO `Klient zalogowany` (Email, Haslo, Imie, Nazwisko, Numer_telefonu) VALUES (?, ?, ?, ?, ?)',
//       [email, hashedPassword, firstName, lastName, phone]
//     );

//     const token = jwt.sign(
//       { id: result.insertId, role: 'client' },
//       'your_jwt_secret',
//       { expiresIn: '24h' }
//     );

//     res.status(201).json({
//       user: {
//         id: result.insertId,
//         email,
//         firstName,
//         lastName,
//         role: 'client'
//       },
//       token
//     });
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

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
