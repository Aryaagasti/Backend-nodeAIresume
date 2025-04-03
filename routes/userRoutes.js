const express = require('express');
const router = express.Router();
const {getUserProfile, getResumeDetails, updateProfile, deleteAccount} = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

router.get('/profile', authMiddleware, getUserProfile )

router.put('/profile', authMiddleware, updateProfile)

router.get('/resume/:resumeId', authMiddleware, getResumeDetails)

router.delete('/profile', authMiddleware, deleteAccount)

module.exports = router;