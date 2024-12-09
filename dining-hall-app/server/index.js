const express = require('express');
const cors = require('cors');
const connectToDatabase = require('./services/db');
const checkInController = require('./controllers/checkInController');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

connectToDatabase().then((db) => {
  const { createCheckIn, getAllCheckIns, checkOut } = checkInController(db);

  // Define routes
  app.post('/checkin', createCheckIn); // POST /checkin for check-in
  app.get('/checkins', getAllCheckIns); // GET /checkins to fetch all (optional)
  app.patch('/checkin/:id/checkout', checkOut); // PATCH /checkin/:id/checkout for check-out (optional)

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to the database:', err);
});
