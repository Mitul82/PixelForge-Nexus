import 'dotenv/config';

import express from 'express';

import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import connectDB from './database/connectdb.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import documentRoutes from './routes/documentRoutes.js';

const app = express();

app.use(express.json({ limit: '10mb' }));

app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'"],
            "style-src": ["'self'", "'unsafe-inline'"],
            "connect-src": ["'self'", process.env.FRONTEND_URL as string, "wss:"],
            "img-src": ["'self'", "data:", "https://res.cloudinary.com"],
            "object-src": ["'none'"],
            "base-uri": ["'self'"],
            "frame-ancestors": ["'none'"],
            "upgrade-insecure-requests": []
        }
    }
}));

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try agian after some time',
    standardHeaders: true,
    legacyHeaders: false
}));

// static files for upload
app.use('/upload', express.static('uploads'));

// checking api status
app.use('/api/status', (req, res) => {
    res.status(200).json({ success: true, message: 'Backend is up and running', timestamp: new Date().toISOString() });
});

// all other api routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/documents', documentRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

const port: string | 3000 = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDB(process.env.MONGODB_URI as string);
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}...`);
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

start();