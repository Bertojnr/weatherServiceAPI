// routes/weatherRoutes.js
import { Router } from 'express';
import { getWeatherByCityQuery, getStoredWeatherByCityParam } from '../controllers/weatherController.js';

export const weatherRouter = Router();

// GET /weather?city={cityName} - Checks cache, fetches if not found, then caches
weatherRouter.get('/weather', getWeatherByCityQuery);

// GET /weather/:city - Only returns from cache, 404 if not found
weatherRouter.get('/weather/:city', getStoredWeatherByCityParam);

