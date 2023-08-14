const config = require('../config/config');
const csrf = require('csurf');

const SECRET = config.app.secret_key


const csrfProtection = csrf({cookie: true, secret: SECRET, maxAge: 4 * 60 * 1000});

// this middleware creates the CSRF Token on GET request
function createCsrfToken(req, res, next){
    if (req.method === 'GET'){
        res.locals.csrfToken = req.csrfToken();
    }
    next();
  }
  
  // this middleware checks the CSRF Token on POST request
  function checkCsrfToken(req, res, next){
    if (req.method === 'POST'){
      csrfProtection(req, res, next)
    }else{
      next()
    }
  }


// error handler for csrf token
function csrfTokenErrorHandler (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)
    // handle CSRF token errors here
    res.render("dashboard/login", {success: "", info: "", error: "Session ended or csrf token tempered with", csrfToken: req.csrfToken()})
  }


module.exports = {
    csrfProtection,
    createCsrfToken,
    checkCsrfToken,
    csrfTokenErrorHandler
}



