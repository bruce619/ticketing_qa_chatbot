// Imports
const config = require('./config/config');
const express = require('express');

// express app
const app = express();


// MIDDLEWARES



// RUN APP

// app port
const port = config.app.port

// listen to port
app.listen(port, () => console.info(`Chatbot Ticketing System listening on port ${port}`))


module.exports.server = app;