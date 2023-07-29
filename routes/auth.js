const { dashboardSignUpView, processClientSignUp, processAgentSignUp, dashboardLoginView, processLogin, processDashboardSignUp, logout } = require('../controllers/dashboard/authController');
const loginRequired = require('../middleware/auth_middleware');
const express = require('express');
const router = express.Router();

router.get('/signup', dashboardSignUpView);
router.post('/signup', processDashboardSignUp);
router.post('/client/signup', loginRequired("admin", "agent"),  processClientSignUp);
router.post('/client/signup', loginRequired("admin"), processAgentSignUp);
router.get('/login', dashboardLoginView);
router.post('/login', processLogin);
router.post('/logout', logout);


module.exports = router;

