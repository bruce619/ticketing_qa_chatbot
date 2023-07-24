const express = require('express');
const { botHomeView, botHomePost } = require('../controllers/chatbot/botController');
const router = express.Router();




router.get('/', botHomeView)
router.post('/bot/response', botHomePost)

module.exports = router;
