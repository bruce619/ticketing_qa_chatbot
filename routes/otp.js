const express = require('express');
const { otpView, processOTP } = require('../controllers/dashboard/otpController');
const router = express.Router();


router.get('/dashboard/auth/otp/:id', otpView)
router.post('/dashboard/auth/otp/:id', processOTP)


module.exports = router;