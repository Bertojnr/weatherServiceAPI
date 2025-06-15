// db/connection.js
import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        // Ensure MONGODB_URI is loaded from .env
        const MONGODB_URI = process.env.MONGODB_URI;

        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables.');
        }

        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB connected successfully!');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        // Exit process with failure
        process.exit(1);
    }
};

