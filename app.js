// Imports
const config = require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const flashMessages = require('./middleware/flash_messages');
const { csrfProtection, createCsrfToken, checkCsrfToken, csrfTokenErrorHandler } = require('./middleware/csrf_middleware');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const session = require('./middleware/session_middleware');
const file_upload = require('./middleware/file_middleware');

// express app
const app = express();


// MIDDLEWARES

//This example demonstrates adding a generic JSON and URL-encoded parser as a top-level middleware, 
// which will parse the bodies of all incoming requests. 
// This is the simplest setup.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// session middleware
app.use(cookieParser())
app.use(session)


// cors origin
// set CORS Origin
app.use(cors({credentials: true, origin: ['http://localhost:3000']}));


// custom csrf protection middleware
app.use(csrfProtection);
app.use(createCsrfToken);
app.use(checkCsrfToken);
app.use(csrfTokenErrorHandler);


// use static files: css, js, img
app.use(express.static('public'));

// if app is being run behind a proxy like nginx
// app.set('trust proxy', 1);

// set view
app.set('views', './views');
app.set('view engine', 'ejs');

// flash messages middleware
app.use(flash());
app.use(flashMessages)

// initialize multer middleware for file upload
app.use(file_upload.single('image'))


// import routes
app.use('/', require('./routes/bot'));

// RUN APP

// app port
const port = config.app.port

// listen to port
app.listen(port, () => console.info(`Chatbot Ticketing System listening on port ${port}`))


module.exports.server = app;