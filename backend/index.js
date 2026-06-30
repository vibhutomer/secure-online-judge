global.crypto = require('crypto');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const problemRoutes = require('./routes/problemRoutes');
const submitRoutes = require('./routes/submitRoutes');

const app = express();

app.use(express.json());
app.use(cors({
    origin: [
        "https://secure-online-judge.vercel.app", 
        /\.vercel\.app$/,
        "http://localhost:5173"
    ],
    credentials: true
}));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Secure MongoDB Atlas Connected"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submit', submitRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🚀 Secure API Server running on port ${PORT}`);
});