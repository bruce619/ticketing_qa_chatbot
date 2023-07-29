const setupDB = require('../../db/db-setup');
const Client = require('../../models/client');
const User = require('../../models/user');
const {transporter, mailObject} = require('../../config/email_config');

const { hashPassword, comparePasswords, checkUserType } = require('../../utility/helpers');
const { generateOTP, otpTimestamp, generateStaffID } = require('../../utility/utils');
const { clientSignUpSchema, loginSchema, agentSignUpSchema } = require('../../utility/validations');
const Agent = require('../../models/agent');

setupDB();

// Sign up GET 
exports.dashboardSignUpView = async (req, res) => {
    res.render('dashboard/signup', {csrfToken: req.csrfToken()})
}


// Sign up for client POST
exports.processDashboardSignUp = async (req, res) => {
    // remove the csrf token for the req body
    delete req.body._csrf

    // validate req.body data using the joi validation defined in the model
    const {error, value} = clientSignUpSchema.validate(req.body)

    if (error){
        res.render('dashboard/signup', {error: error.details[0].message, csrfToken: req.csrfToken()})
        return
    }

    // check if user already exists
    const clientExist = await User.query().where('email', value.email).first();

    if (clientExist) {
        res.render('dashboard/signup', {error: "Account creation failed.", csrfToken: req.csrfToken()})
        return 
    }

    // hash the user password
    value.password = hashPassword(value.password)

    try {

        // insert client into the user table
        const newClient =  await User.query().insert(value)

        console.log(newClient.id)

        // create the client profile
        await Client.query().insert({user_id: newClient.id})

        req.flash('success', `${newClient.first_name} account has been created`)
        res.redirect("/login")

    } catch (err){
        console.error(err)
        res.render('dashboard/signup', {error: "Error creating client.", csrfToken: req.csrfToken()})
        return 
    }

}

// Sign up for client POST
exports.processClientSignUp = async (req, res) => {
    // remove the csrf token for the req body
    delete req.body._csrf

    // validate req.body data using the joi validation defined in the model
    const {error, value} = clientSignUpSchema.validate(req.body)

    if (error){
        res.render('dashboard/signup', {error: error.details[0].message, csrfToken: req.csrfToken()})
        return
    }

    // check if user already exists
    const clientExist = await User.query().where('email', value.email).first();

    if (clientExist) {
        res.render('dashboard/signup', {error: "Account creation failed.", csrfToken: req.csrfToken()})
        return 
    }

    // hash the user password
    value.password = hashPassword(value.password)

    try {

        // insert client into the user table
        const newClient =  await User.query().insert(value)

        console.log(newClient.id)

        // create the client profile
        await Client.query().insert({user_id: newClient.id})

        req.flash('success', `${newClient.first_name} account has been created`)
        res.redirect("/create/client")

    } catch (err){
        console.error(err)
        res.render('dashboard/signup', {error: "Error creating client.", csrfToken: req.csrfToken()})
        return 
    }

}


// Sign up for client POST
exports.processAgentSignUp = async (req, res) => {
    // remove the csrf token for the req body
    delete req.body._csrf

    // validate req.body data using the joi validation defined in the model
    const {error, value} = agentSignUpSchema.validate(req.body)

    if (error){
        res.render('dashboard/signup', {error: error.details[0].message, csrfToken: req.csrfToken()})
        return
    }

    // check if agent already exists
    const agentExist = await User.query().where('email', value.email).first();

    if (agentExist) {
        res.render('dashboard/signup', {error: "Account creation failed.", csrfToken: req.csrfToken()})
        return 
    }

    // hash the user password
    value.password = hashPassword(value.password)

    const staff_id = generateStaffID()

    try {

        // insert client into the user table
        const newAgent =  await User.query().insert(value)

        // create the client profile
        await Agent.query().insert({user_id: newAgent.id, staff_id: staff_id, is_admin: value.is_admin, department: value.department})

        req.flash('success', `${newAgent.first_name} account has been created with staff id ${staff_id}`)
        res.redirect("/create/agent")

    } catch (err){
        console.error(err)
        res.render('dashboard/signup', {error: "Error creating agent.", csrfToken: req.csrfToken()})
        return 
    }

}


// Login GET
exports.dashboardLoginView = async (req, res) => {
    res.render('dashboard/login', {csrfToken: req.csrfToken()})
}


exports.processLogin = async (req, res) =>{
    // remove the csrf token for the req body
    delete req.body._csrf

    // validate req.body data using the joi validation defined in the model
    const {error, value} = loginSchema.validate(req.body);

    if (error){
        res.render('dashboard/login', {error: "Error with credentials.", csrfToken: req.csrfToken()})
        return 
    }

    // first check if user exists
    const user = await User.query().where('email', value.email).first();

    if (!user){
        res.render('dashboard/login', {error: "Invalid Email or Password", csrfToken: req.csrfToken()})
        return
    }

    // compare user input passwword and hashed user password that was saved in the db
    const passwordExists = await comparePasswords(value.password, user.password);
    // if it doesn't match return invalid email or password message
    if (!passwordExists){
        res.render('dashboard/login', {error: "Invalid Email or Password", csrfToken: req.csrfToken()})
        return
    }

    // if user has two_fa_enabled 
    // send otp to user's email
    if (user.two_fa_enabled === true){
        const otp = generateOTP()
        const timestamp_ = otpTimestamp()

        const otp_obj = {
            otp: otp,
            expiration_time: timestamp_
        }

        user.$query()
        .update(otp_obj)
        .then(()=>{

          const mailOptions = mailObject(
            user.email,
            "OTP",
            `Here is your OTP: ${otp}`
            )

        transporter.sendMail(mailOptions, function(err, data) {
            if (err) {
              console.log("Error " + err);
              res.redirect("/login")
              return

            } else {
              req.flash('info', `An OTP has been sent to your email`)
              res.redirect(`/auth/otp/${user.id}`)
              return

            }
          });

        })
        .catch((err)=>{
          console.error(err)
          res.redirect("/login")
          return
      })
        
    } else {
        // res.redirect("/dashboard/client/home")
        const type = await checkUserType(User, user.id)
        req.session.userId = user.id
        req.session.role = type

        if (type === 'client'){
            req.flash('success', `Client Login Successful`)
            res.redirect("/dashboard/client/home")
        } else if (type === 'admin'){
            req.flash('success', `Admin Login Successful`)
            res.redirect("/dashboard/admin/home")
        }else if (type === 'agent' ){
            req.flash('success', `Admin Login Successful`)
            res.redirect("/dashboard/agent/home")
        }

    }
   
}

// GET: logout
exports.logout = async (req, res) => {
    // destroy session
    req.session.destroy(function (err) {
        if (err){
            return console.log(`Error ${err}`);
        }
        
        // redirect to login and prevent going back to authenticated page
        res.set('cache-control', 'no-cache, no-store, must-revalidate')
        res.set('pragma', 'no-cache')
        res.redirect('/login')
    });
}