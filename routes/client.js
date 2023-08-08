const { clientProfileView, clientTicketView, processClientProfileUpdate, processClientTickets, rateTicket, clientGetTicketData } = require('../controllers/dashboard/clientController');
const loginRequired = require('../middleware/auth_middleware');
const express = require('express');
const router = express.Router();


router.get('/dashboard/client/edit-profile', loginRequired("client"), clientProfileView);
router.post('/dashboard/client/edit-profile', loginRequired("client"), processClientProfileUpdate);
router.get('/dashboard/client/ticket', loginRequired("client"), clientTicketView);
router.post('/dashboard/client/ticket', loginRequired("client"), processClientTickets);
router.post('/dashboard/rate/ticket/:ticketId', loginRequired("client"), rateTicket);


module.exports = router;


