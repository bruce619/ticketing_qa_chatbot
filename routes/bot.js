const express = require('express');
const router = express.Router();
const { HomeView, processbotResponseHomeView, getConversations, sendMessage } = require('../controllers/chatbot/botController');


router.get('/', HomeView)
router.post('/bot/response', processbotResponseHomeView)
router.get('/api/conversations/:ticketId', getConversations)
router.post('/api/send-message', sendMessage)

module.exports = router;
