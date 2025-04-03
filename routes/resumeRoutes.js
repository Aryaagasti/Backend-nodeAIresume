const express = require('express'); 
const router = express.Router(); 
const {analyzeResume,getUserResumes} = require('../controllers/resumeController')
const authMiddleware =  require('../middleware/auth')
const multer = require("multer")

const storage = multer.memoryStorage();
const upload = multer({storage})

router.post('/analyze', authMiddleware,upload.single('resume'), analyzeResume)

router.get('/', authMiddleware, getUserResumes)

module.exports = router;