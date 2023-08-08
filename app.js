// Imports
const config = require('./config/config');
const express = require('express');
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
// use static files: css, js, img
app.use(express.static('public'));

// if app is being run behind a proxy like nginx
// app.set('trust proxy', 1);

// set view
app.set('views', './views');
app.set('view engine', 'ejs');

// Middleware to parse JSON data
app.use(express.json());
// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));


// session middleware
app.use(cookieParser())
app.use(session)


// set CORS Origin
app.use(cors({credentials: true, origin: ['http://localhost:3000']}));


// custom csrf protection middleware
app.use(csrfProtection);
app.use(createCsrfToken);
app.use(checkCsrfToken);
app.use(csrfTokenErrorHandler);

// flash messages middleware
app.use(flash());
app.use(flashMessages)

// initialize multer middleware for file upload
app.use(file_upload.single('image'))


// import routes
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/bot'));
app.use('/', require('./routes/otp'));
app.use('/', require('./routes/staff'));
app.use('/', require('./routes/client'));
app.use('/', require('./routes/recover'));

// RUN APP

// app port
const port = config.app.port

// listen to port
app.listen(port, () => console.info(`Chatbot Ticketing System listening on port ${port}`))


module.exports.server = app;