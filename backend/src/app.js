import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Question Management API is running' });
});

export default app;
