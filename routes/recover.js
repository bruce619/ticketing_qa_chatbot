const express = require('express');
const { forgotPasswordView, processForgotPassword, createNewPasswordView, processCreateNewPassword } = require('../controllers/dashboard/recoverController');
const router = express.Router();


router.get('/forgot-password', forgotPasswordView);
router.post('/forgot-password', processForgotPassword);
router.get('/reset-password/:token', createNewPasswordView);
router.post('/reset-password/:token', processCreateNewPassword);

module.exports = router;