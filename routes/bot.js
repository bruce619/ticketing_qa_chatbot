const express = require('express');
const router = express.Router();
const { HomeView, processbotResponseHomeView } = require('../controllers/chatbot/botController');


router.get('/', HomeView)
router.post('/bot/response', processbotResponseHomeView)

module.exports = router;
