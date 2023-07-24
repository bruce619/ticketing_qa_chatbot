function flashMessages(req, req, next){
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    res.locals.info = req.flash('info');
    next();
}


module.exports = flashMessages;