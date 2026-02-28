import app from './app.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
