// models/Weather.js
import mongoose from 'mongoose'; // Change from require
import normalize from "normalize-mongoose";

const weatherSchema = new mongoose.Schema({
    city: {
        type: String,
        required: true,
        unique: true, // Ensures no duplicate cities in the database
        lowercase: true, // Stores city names in lowercase for consistent querying
        trim: true // Removes whitespace from both ends of a string
    },
    temperature: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    feelsLike: { // Added for more comprehensive weather data
        type: Number,
        required: true
    },
    humidity: { // Added for more comprehensive weather data
        type: Number,
        required: true
    },
    pressure: { // Added for more comprehensive weather data
        type: Number,
        required: true
    },
    windSpeed: { // Added for more comprehensive weather data
        type: Number,
        required: true
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

weatherSchema.plugin(normalize);
export const Weather =  mongoose.model('Weather', weatherSchema); // Change from module.exports