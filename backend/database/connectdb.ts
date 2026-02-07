import mongoose from 'mongoose';

const connectDB = async (url: string) => {
    try {
        mongoose.connection.on('connected', () => {
            console.log('Connected to MongoDB....✅');
        });

        return await mongoose.connect(url);
    } catch (err) {
        console.error('Database connection error:', err);
    }
}

export default connectDB;