const { dashboardSignUpView, processClientSignUp, processAgentSignUp, dashboardLoginView, processLogin, processDashboardSignUp, logout } = require('../controllers/dashboard/authController');
const express = require('express');
const router = express.Router();

router.get('/dashboard/signup', dashboardSignUpView);
router.post('/dashboard/signup', processDashboardSignUp);
router.get('/dashboard/login', dashboardLoginView);
router.post('/dashboard/login', processLogin);
router.get('/dashboard/logout', logout);

module.exports = router;

