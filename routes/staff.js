const { dashboardHomeView, staffProfileView, processClientSignUp, 
    processAgentSignUp, processStaffProfileUpdate, reports, 
    createAgentView, createClientView, adminTicketView, 
    processAdminTickets, agentTicketView, processAgentTickets, 
    staffEditClient, adminEditAgent, getAgentEmails, processAdminEditTickets, processAgentEditTickets} = require('../controllers/dashboard/staffController');
const loginRequired = require('../middleware/auth_middleware');
const express = require('express');
const router = express.Router();


router.get('/dashboard/home', loginRequired("admin", "agent"), dashboardHomeView);
router.get('/dashboard/staff/edit-profile', loginRequired("admin", "agent"), staffProfileView);
router.post('/dashboard/staff/edit-profile', loginRequired("admin", "agent"), processStaffProfileUpdate);
router.get('/dashboard/create/agent', loginRequired("admin"), createAgentView);
router.post('/dashboard/create/agent', loginRequired("admin"), processAgentSignUp);
router.post('/dashboard/edit/agent-info', loginRequired("admin"),  adminEditAgent);
router.get('/dashboard/create/client', loginRequired("admin", "agent"),  createClientView);
router.post('/dashboard/create/client', loginRequired("admin", "agent"),  processClientSignUp);
router.post('/dashboard/edit/client-info', loginRequired("admin", "agent"),  staffEditClient);
router.get('/dashboard/admin/ticket', loginRequired("admin"), adminTicketView);
router.post('/dashboard/admin/ticket', loginRequired("admin"), processAdminTickets);
router.post('/dashboard/admin/edit-ticket', loginRequired("admin"), processAdminEditTickets);
router.get('/api/agent-emails/:tag', getAgentEmails);
router.get('/dashboard/agent/ticket', loginRequired("agent"), agentTicketView);
router.post('/dashboard/agent/ticket', loginRequired("agent"), processAgentTickets);
router.post('/dashboard/agent/edit-ticket', loginRequired("agent"), processAgentEditTickets);
router.get('/dashboard/reports', loginRequired("admin", "agent"),  reports);


module.exports = router;
