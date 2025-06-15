// controllers/weatherController.js
import axios from 'axios';
import Joi from 'joi';
import { Weather } from '../models/weatherModel.js'; // Adjust path as per new structure

// Joi Schema for validating city name in queries/params
const citySchema = Joi.object({
    city: Joi.string().trim().min(2).required().messages({
        'string.base': 'City name must be a string.',
        'string.empty': 'City name cannot be empty.',
        'string.min': 'City name must be at least {#limit} characters long.',
        'any.required': 'City name is required.'
    })
});

// Helper function to fetch weather from OpenWeatherMap
const fetchWeatherFromExternalAPI = async (cityName) => {
    const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
    const OPENWEATHER_BASE_URL = process.env.OPENWEATHER_BASE_URL;

    if (!OPENWEATHER_API_KEY) {
        throw new Error('OpenWeatherMap API key is not configured.');
    }

    try {
        const response = await axios.get(OPENWEATHER_BASE_URL, {
            params: {
                q: cityName,
                appid: OPENWEATHER_API_KEY,
                units: 'metric' // For Celsius. Use 'imperial' for Fahrenheit
            }
        });

        // Extract relevant data
        const { name, main, weather, wind } = response.data;
        return {
            city: name.toLowerCase(), // Store normalized city name
            temperature: main.temp,
            description: weather[0].description,
            feelsLike: main.feels_like,
            humidity: main.humidity,
            pressure: main.pressure,
            windSpeed: wind.speed
        };
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('OpenWeatherMap API error:', error.response.data);
            if (error.response.status === 404) {
                throw new Error('City not found by external weather API.');
            }
            throw new Error(`External API error: ${error.response.status} - ${error.response.statusText}`);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('OpenWeatherMap API no response:', error.request);
            throw new Error('No response from external weather API.');
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('OpenWeatherMap API request setup error:', error.message);
            throw new Error(`Error setting up external API request: ${error.message}`);
        }
    }
};


// Controller for GET /weather?city={cityName}
export const getWeatherByCityQuery = async (req, res) => {
    const { city } = req.query;

    // 1. Validate input
    const { error } = citySchema.validate({ city });
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const normalizedCity = city.toLowerCase().trim();

    try {
        // 2. Check if city's weather data already exists in the database
        let weatherData = await Weather.findOne({ city: normalizedCity });

        if (weatherData) {
            // Data exists, return it
            console.log(`Returning cached weather for ${normalizedCity}`);
            return res.status(200).json(weatherData);
        } else {
            // 3. If it does not exist, fetch from external API
            console.log(`Fetching new weather data for ${normalizedCity} from OpenWeatherMap`);
            const newWeatherData = await fetchWeatherFromExternalAPI(normalizedCity);

            // 4. Save the new data to the database
            const savedWeatherData = await Weather.create(newWeatherData);
            console.log(`Cached new weather data for ${normalizedCity}`);
            return res.status(201).json(savedWeatherData);
        }
    } catch (error) {
        console.error(`Error processing weather request for ${city}:`, error);
        if (error.message.includes('City not found by external weather API')) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error while fetching weather.', error: error.message });
    }
};

// Controller for GET /weather/:city
export const getStoredWeatherByCityParam = async (req, res) => {
    const { city } = req.params;

    // 1. Validate input (same schema can be reused)
    const { error } = citySchema.validate({ city });
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const normalizedCity = city.toLowerCase().trim();

    try {
        // Check if weather data exists in the database
        const weatherData = await Weather.findOne({ city: normalizedCity });

        if (!weatherData) {
            // If not found in DB, return 404
            return res.status(404).json({ message: `Weather data for city '${city}' not found in cache.` });
        }

        // Data exists, return it
        return res.status(200).json(weatherData);
    } catch (error) {
        console.error(`Error fetching stored weather for ${city}:`, error);
        res.status(500).json({ message: 'Internal server error while retrieving cached weather.', error: error.message });
    }
};