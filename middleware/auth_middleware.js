function loginRequired(req, res, next){
    if (req.session && req.session.userId) {
        // User is authenticated, proceed with the next
        // regenerate csrf token
        res.locals.csrfToken = req.csrfToken()
        return next();
    } else {
        // User is not authenticated
        // redirect to the login page
        req.flash("error", "You Are Not Authenticated!")
        res.redirect('/login');
    }
}

module.exports = {
  loginRequired
}