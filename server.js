// server.js
import 'dotenv/config'; // Load environment variables from .env file
import express from 'express';
import { connectDB } from './db/connection.js'; // Import the database connection function
import { weatherRouter } from './routes/weatherRoutes.js'; // Import our weather routes

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB(); // Call the async function to connect to the DB

// Basic route to check if the server is running (Optional, can be removed if not needed)
app.get('/weather', (req, res) => {
    res.send('Weather Service API is running! Access weather data at /api/v1');
});

// Mount our weather routes
// All routes defined in weatherRoutes.js will be prefixed with /api/weather
app.use('/api/v1', weatherRouter);

// Start the server (after DB connection is initiated, but not necessarily completed,
// as the app.listen is now outside the .then().
// For production, you might want to ensure DB is connected before listening.
// For simplicity here, we let the app start and DB connection is async.
// If DB connection fails, process.exit(1) will terminate the app.
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access weather API at http://localhost:${PORT}/api/v1/weather`);
});