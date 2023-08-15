const express = require('express');
const { forgotPasswordView, processForgotPassword, createNewPasswordView, processCreateNewPassword } = require('../controllers/dashboard/recoverController');
const router = express.Router();

router.get('/dashboard/forgot-password', forgotPasswordView);
router.post('/dashboard/forgot-password', processForgotPassword);
router.get('/dashboard/reset-password/:id/:token', createNewPasswordView);
router.post('/dashboard/reset-password/:id/:token', processCreateNewPassword);

module.exports = router;