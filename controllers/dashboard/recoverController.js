const express = require('express');
const { otpTimestamp, getRandomAlphanumericString } = require('../../utility/utils');
const { mailObject, transporter } = require('../../config/email_config');
const User = require('../../models/user');
const { forgotPasswordSchema, passwordResetSchema } = require('../../utility/validations');
const router = express.Router();


// forget password page 
exports.forgotPasswordView = async (req, res) => {
    res.render('dashboard/forgot_password', {csrfToken: req.csrfToken()})
    return
}


// handles post request to send the password retrieval link
exports.processForgotPassword = async (req, res) => {

    delete req.body._csrf

    const {error, value} = forgotPasswordSchema.validate(req.body);

    if (error){
        res.render('dashboard/forgot_password', {error: error.details[0].message, csrfToken: req.csrfToken()})
        return
    }

    // check if email exists
    const emailExists = await User.query().where("email", value.email).first();
    

    if (!emailExists){
        res.render('dashboard/forgot_password', {error: 'Sorry something went wrong. Try again', csrfToken: req.csrfToken()})
        return
    }

    // set reset token and expiry time
    const reset_token = getRandomAlphanumericString(30)
    const reset_token_expiry_time = otpTimestamp()

    emailExists.reset_password_token = reset_token;
    emailExists.reset_password_expiry_time = reset_token_expiry_time;

    emailExists.$query().patch({
        reset_password_token: emailExists.reset_password_token,
        reset_password_expiry_time: emailExists.reset_password_expiry_time
    }).then(()=>{

        // password reset link
        const password_reset_link = `${req.protocol}://${req.get('host')}/reset-password/${reset_token}/`;

        const mailOptions = mailObject(
            emailExists.email,
            "Password Reset Link",
            `Click on this link to create your new password: ${password_reset_link}`,
            )

        transporter.sendMail(mailOptions, function(err, data) {
            if (err) {
              console.log("Error " + err);
              res.redirect("/login")
              return
            } else {
              req.flash("success", "Password reset link has been sent to your email")
              res.redirect("/login")
              return
            }
          });

    })
    .catch((err)=>{
        console.error(err)
        res.redirect("/login")
    })
}


exports.createNewPasswordView = async (req, res) => {
    const {error, value} = tokenSchema.validate(req.params)

    if (error){
        res.render('dashboard/forgot_password', {error: error.details[0].message, csrfToken: req.csrfToken()})
        return
    }

    User.query().findOne({reset_password_token: value.token})
    .where('reset_password_expiry_time', '>', getCurrentTimestamp())
    .then(user => {
        if (!user){
            res.render('dashboard/forgot_password', {error: 'Token has expired or is Invalid', csrfToken: req.csrfToken()})
            return
        }
        res.render("dashboard/create_password", {reset_token: value.token, csrfToken: req.csrfToken()})
        return
    })
    .catch((err)=>{
        console.error(err)
        res.redirect('/login');
    })

}


exports.processCreateNewPassword = async (req, res) => {

    delete req.body._csrf

    const new_req_obj = {...req.body, ...req.params}

    const {error, value} = passwordResetSchema.validate(new_req_obj)

    if (error){
        res.render('dashboard/forgot_password', {error: error.details[0].message, csrfToken: req.csrfToken()})
        return
    }

    // delete confirm_password
    delete value.confirm_password

    value.password = hashPassword(value.password)

    User.query().findOne({reset_password_token: value.token})
    .where('reset_password_expiry_time', '>', getCurrentTimestamp())
    .then(user => {
        if (!user){
            res.render('dashboard/forgot_password', {error: 'Token has expired or is Invalid', csrfToken: req.csrfToken()})
            return
        }
        
        user.$query().patch({password: value.password})
        .then(()=>{
            req.flash("success", "Password Reset Successful")
            res.redirect("/login")
            return
        })
        .catch((err)=>{
            console.error(err)
            res.redirect("/login")
            return
        })

    })
    .catch((err)=>{
        console.error(err)
        res.redirect("/login")
    })

    
}