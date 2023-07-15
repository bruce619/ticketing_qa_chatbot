// Imports
const config = require('./config/config');
const express = require('express');

// express app
const app = express();


// MIDDLEWARES
// use static files: css, js, img
app.use(express.static('public'));

// set view
app.set('views', './views')
app.set('view engine', 'ejs')


//This example demonstrates adding a generic JSON and URL-encoded parser as a top-level middleware, 
// which will parse the bodies of all incoming requests. 
// This is the simplest setup.
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


// RUN APP

// app port
const port = config.app.port

// listen to port
app.listen(port, () => console.info(`Chatbot Ticketing System listening on port ${port}`))


module.exports.server = app;