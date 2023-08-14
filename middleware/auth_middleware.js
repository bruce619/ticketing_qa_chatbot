// custom middleware to check if the user is logged in and has the correct role
function loginRequired(role, role1 = null) {
  return (req, res, next) => {
    if (!req.session.userId) {
      // User is not logged in, redirect to login page or send an error response
      req.flash("error", "Session Ended. Try to log in again.")
      return res.status(401).redirect('/dashboard/login');
    }

    if (role1 === null) {
      if (req.session.role !== role) {
        // User does not have the correct role, send an error response
        req.flash("error", "Forbidden! Permission to view this page denied!")
        return res.status(403).redirect('/dashboard/login');
      }
    } else {
      if (req.session.role !== role && req.session.role !== role1) {
        // User does not have the correct role, send an error response
        req.flash("error", "Forbidden!")
        return res.status(403).redirect('/dashboard/login');
      }
    }

    // User is logged in and has the correct role, proceed to the next middleware or route handler
    // regenerate csrf token
    res.locals.csrfToken = req.csrfToken();
    next();
  };
}

module.exports = loginRequired;