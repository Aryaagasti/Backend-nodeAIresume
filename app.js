const express = require('express');
const cors  = require('cors')
const morgan = require('morgan')
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const userRoutes =  require('./routes/userRoutes')
const resumeRoutes =  require('./routes/resumeRoutes')
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({
  origin: ['*', 'https://resumepro-resume-analyzer-career.onrender.com']
}));
app.use(express.json());
app.use(morgan('dev'));

//connect to db
connectDB()

//Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/resume',resumeRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});