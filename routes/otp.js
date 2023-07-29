const express = require('express');
const { otpView, processOTP } = require('../controllers/dashboard/otpController');
const router = express.Router();


router.get('/auth/otp/:id', otpView)
router.post('/auth/otp/:id', processOTP)


module.exports = router;