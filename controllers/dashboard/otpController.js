// User controller handles users information and profile
const setupDB = require('../../db/db-setup');
const User = require('../../models/user');
const { checkUserType } = require('../../utility/helpers');
const { getCurrentTimestamp } = require('../../utility/utils');
const { otpSchema, uuidSchema } = require('../../utility/validations');

setupDB();

exports.otpView = async (req, res) => {

    const {error, value } = uuidSchema.validate(req.params)

    if (error){
        res.render('dashboard/login', {error: error.details[0].message})
        return
    }

    const userExists = await User.query().findById(value.id)

    if (!userExists){ // start if
        // redirect to login cause user doesn't exists
        res.render('dashboard/login', {error: 'Error occured when processing this. Try again', csrfToken: req.csrfToken()})
        return
    }else{
        res.render("dashboard/otp", {user: userExists.id, csrfToken: req.csrfToken()});
    } // end if

}


exports.processOTP = async (req, res) => {

    delete req.body._csrf

    const new_req_obj = {...req.body, ...req.params}

    const {error, value} = otpSchema.validate(new_req_obj)
       
    if (error){
        res.render('dashboard/login', {error: error.details[0].message, csrfToken: req.csrfToken()})
        return
    }

    // check if the user exists in the db
  const userExists = await User.query().findById(value.id).first();

  if (!userExists){ // start if

      // redirect to login if user doesn't exists
      res.render('dashboard/login', {error: 'Invalid request', csrfToken: req.csrfToken()})
      return

  } // end if

  const otpExists = await User.query().where("otp", value.otp).first()

  if (!otpExists){ // start if
    // redirect to login cause user doesn't exists
    // otp has expired
    res.render('dashboard/login', {error: 'Invalid or expired OTP', csrfToken: req.csrfToken()})
    return

} // end if

  // check if the timestamp has expired
  const current_timestamp = getCurrentTimestamp()

  if (current_timestamp > userExists.expiration_time){
    // otp has expired
    res.render('dashboard/login', {error: 'OTP is invalid or has expired', csrfToken: req.csrfToken()})
    return

  }else{

    const type = await checkUserType(User, userExists.id)
    req.session.userId = userExists.id
    req.session.role = type

    if (type === 'client'){
        req.flash('success', `Client Login Successful`)
        res.redirect("/dashboard/client/ticket")
    } else if (type === 'admin' || type === 'agent'){
        req.flash('success', `Login Successful`)
        res.redirect("/dashboard/home")
    }

}

}