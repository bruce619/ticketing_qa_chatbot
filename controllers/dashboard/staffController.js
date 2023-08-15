const {transporter, mailObject} = require('../../config/email_config');
const Client = require('../../models/client');
const User = require('../../models/user');
const Agent = require('../../models/agent');
const Ticket = require('../../models/ticket');
const { clientSignUpSchema, agentSignUpSchema, staffProfileUpdateSchema, userSearchSchema, clientProfileUpdateSchema, agentCreateTicketSchema, editAdminTicketSchema } = require('../../utility/validations');
const { hashPassword } = require('../../utility/helpers');
const { generateStaffID, genPassword, generateRandomTicketId, getRandomAlphanumericString, otpTimestamp } = require('../../utility/utils');
const { getResponse } = require('../../models/chatbot_model/chatbot');
const setupDB = require('../../db/db-setup');

setupDB();

// Staff (Admin/Agent) Dashbard Home View
// Method: GET
exports.dashboardHomeView = async (req, res) => {

        const today = new Date().toISOString().slice(0, 10);
        
        const totalTicketsForToday = await Ticket.query()
        .count('id as totalTickets')
        .whereRaw('DATE(created_at) = ?', today)
        .first();
      
        const totalTicketsToday = parseInt(totalTicketsForToday.totalTickets, 10);

        // STATUS
        const openTicketCount = await Ticket.query().where('status', 'OPEN').resultSize();        
        const closedTicketCount = await Ticket.query().where('status', 'CLOSED').resultSize();        
        const inprogressTicketCount = await Ticket.query().where('status', 'IN_PROGRESS').resultSize(); 
        
        // PRIORITY
        const lowPriorityCount = await Ticket.query().where('priority', 'LOW').resultSize();        
        const mediumPriorityCount = await Ticket.query().where('priority', 'MEDIUM').resultSize();        
        const highPriorityCount = await Ticket.query().where('priority', 'HIGH').resultSize(); 

        const user_id = req.session.userId
        const user_role = req.session.role
        const current_user = await User.query().findById(user_id).first()
        const totalTickets = await Ticket.query().resultSize();
        const totalAgents = await Agent.query().resultSize();
        const totalClients = await Client.query().resultSize();
        
        try {

            res.render('dashboard/dashboard', {
            todaysTicketCount: totalTicketsToday,
            totalTickets: totalTickets,
            totalAgents: totalAgents,
            openTicketCount: openTicketCount,
            closedTicketCount: closedTicketCount,
            inprogressTicketCount: inprogressTicketCount,
            lowPriorityCount: lowPriorityCount,
            mediumPriorityCount: mediumPriorityCount,
            highPriorityCount: highPriorityCount,
            totalClients: totalClients,
            current_user: current_user,
            user_role: user_role,
            csrfToken: req.csrfToken()        
        })

    } catch (err) {
        console.error(err)
        return
    }
}


// Staff (Admin and Agent) Dashboard Edit Profile
// Method: GET
exports.staffProfileView = async (req, res) => {
    try {
        const user_id = req.session.userId
        const user_role = req.session.role
        const current_user = await User.query().findById(user_id).withGraphFetched('agent').first()
        res.render('dashboard/editprofile', {current_user: current_user, user_role: user_role, csrfToken: req.csrfToken()})
    } catch (err) {
        console.error(err)
        return
    }
     
}

exports.processStaffProfileUpdate = async (req, res) => {

    delete req.body._csrf

    if (!('two_fa_enabled' in req.body)){
        req.body.two_fa_enabled = false;
      }else{
        req.body.two_fa_enabled = Boolean(req.body.two_fa_enabled)
      }


      const user_id = req.session.userId
      const user_role = req.session.role
      const current_user = await User.query().findById(user_id).withGraphFetched('agent').first()


      const {error, value} = staffProfileUpdateSchema.validate(req.body)


      if (error){
        res.render('dashboard/editprofile', {current_user: current_user, user_role: user_role, error: error.details[0].message, csrfToken: req.csrfToken()})
        return
    }

    const currentTime = new Date();

    try {

        current_user.first_name = value.first_name
        current_user.last_name = value.last_name
        current_user.email = value.email
        current_user.two_fa_enabled = value.two_fa_enabled
        current_user.updated_at = currentTime

        // Update the agent fields
        if (current_user.agent) {
            current_user.agent.department = value.department;
        }

        // Save the changes to the user and agent tables
        await current_user.$query().patch();

        if (current_user.agent) {
        await current_user.agent.$query().patch();
        }

        req.flash('success', `Profile updated successfully Successful`)
        res.redirect("/dashboard/home")


    } catch (err) {
        console.log(`Error Updating Profile ${err}`)
        res.render('dashboard/editprofile', {current_user: current_user, user_role: user_role, error: "An error occurred while updating profile", csrfToken: req.csrfToken()})
        return
    }

}


// get view for creating client. both admin and agent can view all client and and create a client.
// method: GET
exports.createClientView = async (req, res) => {
    try{

        // page size for pagination
        const page_size = 2;

        // current page
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const offset = (page - 1) * page_size;

        let clients =  await User.query()
        .whereIn('id', function() {
          this.select('user_id').from('clients');
        }).withGraphFetched('client').offset(offset).limit(page_size).orderBy('created_at', 'desc');

        let totalClients = await Client.query().resultSize();
        
        const user_id = req.session.userId
        const user_role = req.session.role
        const current_user = await User.query().findById(user_id).first()
        let total_pages = Math.ceil(totalClients / page_size);

        if (Object.keys(req.query).length === 0){

            res.render('dashboard/clients', {
                current_user: current_user, 
                user_role: user_role,
                clients: clients,
                search_result: '', 
                total_pages: total_pages,
                current_page: page,
                csrfToken: req.csrfToken()
            })
            return
        }else if (Object.keys(req.query).length === 1 && req.query.hasOwnProperty('page')){
            res.render('dashboard/clients', {
                current_user: current_user, 
                user_role: user_role,
                clients: clients,
                search_result: '', 
                total_pages: total_pages,
                current_page: page,
                csrfToken: req.csrfToken()
            })
            return
        }else{

            const {error, value} = userSearchSchema.validate(req.query)

            // check if error exists in user input
            if (error){
                res.render('dashboard/dashboard', {
                    todaysTicketCount: 0,
                    totalTickets: 0,
                    totalAgents: 0,
                    totalClients: 0,
                    openTicketCount: 0,
                    closedTicketCount: 0,
                    inprogressTicketCount: 0,
                    lowPriorityCount: 0,
                    mediumPriorityCount: 0,
                    highPriorityCount: 0, 
                    current_user: current_user, 
                    user_role: user_role, 
                    error: error.details[0].message, 
                    csrfToken: req.csrfToken()})
                return
            }

            const search_results =  await User.query()
            .whereIn('id', function() {
            this.select('user_id').from('clients');
            })
            .withGraphFetched('client')
            .offset(offset)
            .limit(page_size)
            .where('first_name', 'ilike', `%${value.search}%`)
            .orWhere('last_name', 'ilike', `%${value.search}%`)
            .orderBy('created_at', 'desc');

            totalClients = await Client.query()
            .alias('c')
            .where(function() {
              this.whereExists(
                User.query()
                  .alias('u')
                  .whereColumn('u.id', 'c.user_id')
                  .andWhere(function() {
                    this.orWhere('u.first_name', 'ilike', `%${value.search}%`)
                      .orWhere('u.last_name', 'ilike', `%${value.search}%`);
                  })
              );
            })
            .offset(offset)
            .limit(page_size)
            .resultSize(); 
            
            total_pages = Math.ceil(totalClients / page_size);

            res.render('dashboard/clients', {
                current_user: current_user, 
                user_role: user_role,
                clients: '',
                search_results: search_results, 
                total_pages: total_pages,
                current_page: page,
                csrfToken: req.csrfToken()
            })
                        
        }

    } catch (err){
        console.error(err)
        return 
    }
}

// admin and agents can update client first name and last name
// method: POST
exports.staffEditClient = async (req, res) => {
    const user_id = req.session.userId
    const user_role = req.session.role
    const current_user = await User.query().findById(user_id).first()

    // remove the csrf token for the req body
    delete req.body._csrf

    const {error, value} = clientProfileUpdateSchema.validate(req.body)

    if (error){
        res.render('dashboard/dashboard', {
            todaysTicketCount: 0,
            totalTickets: 0,
            totalAgents: 0,
            totalClients: 0,
            openTicketCount: 0,
            closedTicketCount: 0,
            inprogressTicketCount: 0,
            lowPriorityCount: 0,
            mediumPriorityCount: 0,
            highPriorityCount: 0,   
            current_user: current_user, 
            user_role: user_role, 
            error: error.details[0].message, 
            csrfToken: req.csrfToken()})
        return
    }

    const currentTime = new Date();

    try {

        const selected_client = await User.query().where("email", value.email).withGraphFetched('client').first();

        selected_client.first_name = value.first_name
        selected_client.last_name = value.last_name
        selected_client.email = value.email
        selected_client.updated_at = currentTime

        // Update the client fields
        if (selected_client.client) {
            selected_client.client.location = value.location;
            selected_client.client.phone = value.phone;
            selected_client.client.updated_at = currentTime
        }

        // Save the changes to the user and client tables
        await selected_client.$query().patch();

        if (selected_client.client) {
        await selected_client.client.$query().patch();
        }

        
        const mailOptions = mailObject(
            selected_client.email,
            "Account Updated",
            `Hi ${selected_client.first_name} your account has been updated`,
            )

        transporter.sendMail(mailOptions, function(err, data) {
            if (err) {
                console.log("Error " + err);
                res.redirect("/dashboard/home")
                return
            } else {
                req.flash('success', 'Sucessfully updated client info')
                res.redirect('/dashboard/create/client')
                return
            }
            });



    } catch (err) {
        console.log(`Error Updating Staff Info ${err}`)
        res.render('dashboard/dashboard', {
            todaysTicketCount: 0,
            totalTickets: 0,
            totalAgents: 0,
            totalClients: 0,
            openTicketCount: 0,
            closedTicketCount: 0,
            inprogressTicketCount: 0,
            lowPriorityCount: 0,
            mediumPriorityCount: 0,
            highPriorityCount: 0,   
            current_user: current_user, 
            user_role: user_role, 
            error: "An error occurred while updating client info", 
            csrfToken: req.csrfToken()})
        return
    }
}

// admin can update agent first name last name email department and is_admin previleges
// method: POST
exports.adminEditAgent = async (req, res) => {

    const user_id = req.session.userId
    const user_role = req.session.role
    const current_user = await User.query().findById(user_id).first()

    // remove the csrf token for the req body
    delete req.body._csrf

    if (!('is_admin' in req.body)){
        req.body.is_admin = false;
      }else{
        req.body.is_admin = Boolean(req.body.is_admin)
      }

    const {error, value} = staffProfileUpdateSchema.validate(req.body)

    if (error){
        res.render('dashboard/dashboard', {
            todaysTicketCount: 0,
            totalTickets: 0,
            totalAgents: 0,
            totalClients: 0,
            openTicketCount: 0,
            closedTicketCount: 0,
            inprogressTicketCount: 0,
            lowPriorityCount: 0,
            mediumPriorityCount: 0,
            highPriorityCount: 0,   
            current_user: current_user, 
            user_role: user_role, 
            error: error.details[0].message, 
            csrfToken: req.csrfToken()})
        return
    }

    const currentTime = new Date();

    try {

        const selected_agent = await User.query().where("email", value.email).withGraphFetched('agent').first();

        selected_agent.first_name = value.first_name
        selected_agent.last_name = value.last_name
        selected_agent.email = value.email
        selected_agent.updated_at = currentTime

        // Update the agent fields
        if (selected_agent.agent) {
            selected_agent.agent.is_admin = value.is_admin;
            selected_agent.agent.department = value.department;
            selected_agent.agent.updated_at = currentTime
        }

        // Save the changes to the user and agent tables
        await selected_agent.$query().patch();

        if (selected_agent.agent) {
        await selected_agent.agent.$query().patch();
        }

        const mailOptions = mailObject(
            selected_agent.email,
            "Account Updated",
            `Hi ${selected_agent.first_name} your account has been updated`,
            )

        transporter.sendMail(mailOptions, function(err, data) {
            if (err) {
                console.log("Error " + err);
                res.redirect("/dashboard/home")
                return
            } else {
                req.flash('success', 'Sucessfully updated agent info')
                res.redirect('/dashboard/create/agent')
                return
            }
            });


    } catch (err) {
        console.log(`Error Updating Staff Info ${err}`)
        res.render('dashboard/dashboard', {
            todaysTicketCount: 0,
            totalTickets: 0,
            totalAgents: 0,
            totalClients: 0,
            openTicketCount: 0,
            closedTicketCount: 0,
            inprogressTicketCount: 0,
            lowPriorityCount: 0,
            mediumPriorityCount: 0,
            highPriorityCount: 0,   
            current_user: current_user, 
            user_role: user_role, 
            error: "An error occurred while updating agent info", 
            csrfToken: req.csrfToken()})
        return
    }


}


// get view for viewing all agent and creating an agent. only accessible to admin
// method: GET
exports.createAgentView = async (req, res) => {

    try{

        // page size for pagination
        const page_size = 2;

        // current page
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const offset = (page - 1) * page_size;

        let agents =  await User.query()
        .whereIn('id', function() {
          this.select('user_id').from('agents');
        }).withGraphFetched('agent').offset(offset).limit(page_size).orderBy('created_at', 'desc');

        let totalAgents = await Agent.query().resultSize();
        
        const user_id = req.session.userId
        const user_role = req.session.role
        const current_user = await User.query().findById(user_id).first()
        let total_pages = Math.ceil(totalAgents / page_size);

        if (Object.keys(req.query).length === 0){

            res.render('dashboard/admin/agents', {
                current_user: current_user, 
                user_role: user_role,
                agents: agents,
                search_result: '', 
                total_pages: total_pages,
                current_page: page,
                csrfToken: req.csrfToken()
            })
            return
        }else if (Object.keys(req.query).length === 1 && req.query.hasOwnProperty('page')){
            res.render('dashboard/admin/agents', {
                current_user: current_user, 
                user_role: user_role,
                agents: agents,
                search_result: '', 
                total_pages: total_pages,
                current_page: page,
                csrfToken: req.csrfToken()
            })
            return
        }else{

            const {error, value} = userSearchSchema.validate(req.query)

            // check if error exists in user input
            if (error){
                res.render('dashboard/dashboard', {
                    todaysTicketCount: 0,
                    totalTickets: 0,
                    totalAgents: 0,
                    totalClients: 0,
                    openTicketCount: 0,
                    closedTicketCount: 0,
                    inprogressTicketCount: 0,
                    lowPriorityCount: 0,
                    mediumPriorityCount: 0,
                    highPriorityCount: 0,   
                    current_user: current_user, 
                    user_role: user_role, 
                    error: error.details[0].message, 
                    csrfToken: req.csrfToken()})
                return
            }

            const search_results =  await User.query()
            .whereIn('id', function() {
            this.select('user_id').from('agents');
            })
            .withGraphFetched('agent')
            .offset(offset)
            .limit(page_size)
            .where('first_name', 'ilike', `%${value.search}%`)
            .orWhere('last_name', 'ilike', `%${value.search}%`)
            .orderBy('created_at', 'desc');

            totalAgents = await Agent.query()
            .alias('a')
            .where(function() {
              this.whereExists(
                User.query()
                  .alias('u')
                  .whereColumn('u.id', 'a.user_id')
                  .andWhere(function() {
                    this.orWhere('u.first_name', 'ilike', `%${value.search}%`)
                      .orWhere('u.last_name', 'ilike', `%${value.search}%`);
                  })
              );
            })
            .offset(offset)
            .limit(page_size)
            .resultSize(); 
            
            total_pages = Math.ceil(totalAgents / page_size);

            res.render('dashboard/admin/agents', {
                current_user: current_user, 
                user_role: user_role,
                agents: '',
                search_results: search_results, 
                total_pages: total_pages,
                current_page: page,
                csrfToken: req.csrfToken()
            })
                        
        }

    } catch (err){
        console.error(err)
        return 
    }

}


// Sign up for agent and admin to create client
// Method: POST
exports.processClientSignUp = async (req, res) => {

    const user_id = req.session.userId
    const user_role = req.session.role
    const current_user = await User.query().findById(user_id).first()

    // create random password for client
    req.body.password = genPassword()

    // remove the csrf token for the req body
    delete req.body._csrf

    // validate req.body data using the joi validation defined in the model
    const {error, value} = clientSignUpSchema.validate(req.body)

    if (error){
        res.render('dashboard/dashboard', {
            todaysTicketCount: 0,
            totalTickets: 0,
            totalAgents: 0,
            totalClients: 0,
            openTicketCount: 0,
            closedTicketCount: 0,
            inprogressTicketCount: 0,
            lowPriorityCount: 0,
            mediumPriorityCount: 0,
            highPriorityCount: 0,   
            current_user: current_user, 
            user_role: user_role, 
            error: error.details[0].message, 
            csrfToken: req.csrfToken()})
        return
    }

    // check if user already exists
    const clientExist = await User.query().where('email', value.email).first();

    if (clientExist) {
        res.render('dashboard/dashboard', {
            todaysTicketCount: 0,
            totalTickets: 0,
            totalAgents: 0,
            totalClients: 0,
            openTicketCount: 0,
            closedTicketCount: 0,
            inprogressTicketCount: 0,
            lowPriorityCount: 0,
            mediumPriorityCount: 0,
            highPriorityCount: 0,   
            current_user: current_user, 
            user_role: user_role, 
            error: "Account already exists.", 
            csrfToken: req.csrfToken()})
        return 
    }

    // hash the user password
    value.password = hashPassword(value.password)

    try {

        // insert client into the user table
        const newClient =  await User.query().insert(value)

        // create the client profile
        await Client.query().insert({user_id: newClient.id})


        // set reset token and expiry time
        const reset_token = getRandomAlphanumericString(30)
        const reset_token_expiry_time = otpTimestamp()

        newClient.reset_password_token = reset_token;
        newClient.reset_password_expiry_time = reset_token_expiry_time;

        newClient.$query().patch({
            reset_password_token: newClient.reset_password_token,
            reset_password_expiry_time: newClient.reset_password_expiry_time
        }).then(()=>{

            // password reset link
        const password_reset_link = `${req.protocol}://${req.get('host')}/dashboard/reset-password/${newClient.id}/${reset_token}/`;
        
        console.log(password_reset_link)
        
        const mailOptions = mailObject(
            newClient.email,
            "Account Created",
            `Hi ${newClient.first_name} your account has been created. Click on this link to create your new password: ${password_reset_link}`,
            )


        transporter.sendMail(mailOptions, function(err, data) {
            if (err) {
              console.log("Error " + err);
              res.redirect("/dashboard/home")
              return
            } else {
                req.flash('success', `${newClient.first_name} account has been created`)
                req.flash('info', 'The client will be notifield via email')
                res.redirect("/dashboard/create/client")
              return
            }
          });

        }).catch((err)=>{
        console.error(err)
        res.redirect("/dashboard/home")
    })


    } catch (err){
        console.error(err)
        res.render('dashboard/dashboard', {
            todaysTicketCount: 0,
            totalTickets: 0,
            totalAgents: 0,
            totalClients: 0,
            openTicketCount: 0,
            closedTicketCount: 0,
            inprogressTicketCount: 0,
            lowPriorityCount: 0,
            mediumPriorityCount: 0,
            highPriorityCount: 0,   
            current_user: current_user, 
            user_role: user_role, 
            error: "Error creating client.", 
            csrfToken: req.csrfToken()})
        return 
    }

}


// Sign up for admin to create agent
// method: POST
exports.processAgentSignUp = async (req, res) => {

    const user_id = req.session.userId
    const user_role = req.session.role
    const current_user = await User.query().findById(user_id).first()

    // create random password for client
    req.body.password = genPassword()

    // remove the csrf token for the req body
    delete req.body._csrf

    if (!('is_admin' in req.body)){
        req.body.is_admin = false;
      }else{
        req.body.is_admin = Boolean(req.body.is_admin)
      }

    // validate req.body data using the joi validation defined in the model
    const {error, value} = agentSignUpSchema.validate(req.body)

    if (error){
        res.render('dashboard/dashboard', {
            todaysTicketCount: 0,
            totalTickets: 0,
            totalAgents: 0,
            totalClients: 0,
            openTicketCount: 0,
            closedTicketCount: 0,
            inprogressTicketCount: 0,
            lowPriorityCount: 0,
            mediumPriorityCount: 0,
            highPriorityCount: 0,   
            current_user: current_user, 
            user_role: user_role, 
            error: error.details[0].message, 
            csrfToken: req.csrfToken()})
        return
    }

    // check if agent already exists
    const agentExist = await User.query().where('email', value.email).first();

    if (agentExist) {
        res.render('dashboard/dashboard', {
        todaysTicketCount: 0,
        totalTickets: 0,
        totalAgents: 0,
        totalClients: 0,
        openTicketCount: 0,
        closedTicketCount: 0,
        inprogressTicketCount: 0,
        lowPriorityCount: 0,
        mediumPriorityCount: 0,
        highPriorityCount: 0,   
        current_user: current_user, 
        user_role: user_role, 
        error: "Account creation failed.",
        csrfToken: req.csrfToken()})
        return 
    }

    // hash the user password
    value.password = hashPassword(value.password)

    let staff_id = generateStaffID()

    staffExists = await Agent.query().where('staff_id', staff_id).first();

    if (staffExists){
        staff_id = generateStaffID()
    }

    try {

        // insert agent into the user table
        const newAgent =  await User.query().insert({first_name: value.first_name, last_name: value.last_name, email: value.email, password: value.password})

        // create the agent profile
        await Agent.query().insert({user_id: newAgent.id, staff_id: staff_id, is_admin: value.is_admin, department: value.department})


        // set reset token and expiry time
        const reset_token = getRandomAlphanumericString(30)
        const reset_token_expiry_time = otpTimestamp()

        newAgent.reset_password_token = reset_token;
        newAgent.reset_password_expiry_time = reset_token_expiry_time;

        newAgent.$query().patch({
            reset_password_token: newAgent.reset_password_token,
            reset_password_expiry_time: newAgent.reset_password_expiry_time
        }).then(()=>{

            // password reset link
        const password_reset_link = `${req.protocol}://${req.get('host')}/dashboard/reset-password/${newAgent.id}/${reset_token}/`;
        
        console.log(password_reset_link)
        
        const mailOptions = mailObject(
            newAgent.email,
            "Create Your Password",
            `Your account has been created. Click on this link to create your new password: ${password_reset_link}`,
            )

        transporter.sendMail(mailOptions, function(err, data) {
            if (err) {
              console.log("Error " + err);
              res.redirect("/dashboard/home")
              return
            } else {
                req.flash('success', `${newAgent.first_name} account has been created with staff id ${staff_id}`)
                req.flash('info', 'The agent will be notified via email')
                res.redirect("/dashboard/home")
              return
            }
          });

        }).catch((err)=>{
        console.error(err)
        res.redirect("/dashboard/home")
    })


    } catch (err){
        console.error(err)
        res.render('dashboard/dashboard', {
            todaysTicketCount: 0,
            totalTickets: 0,
            totalAgents: 0,
            totalClients: 0,
            openTicketCount: 0,
            closedTicketCount: 0,
            inprogressTicketCount: 0,
            lowPriorityCount: 0,
            mediumPriorityCount: 0,
            highPriorityCount: 0,   
            current_user: current_user, 
            user_role: user_role, 
            error: "Error creating agent.", 
            csrfToken: req.csrfToken()})
        return 
    }

}


// create view ticket page for only admin
// method: GET
exports.adminTicketView = async (req, res) => {

    try {

        // page size for pagination
        const page_size = 2;

        // current page
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const offset = (page - 1) * page_size;

        const user_id = req.session.userId
        const user_role = req.session.role
        const current_user = await User.query().findById(user_id).withGraphFetched('client').first()


        let totalTickets = await Ticket.query().resultSize();

        // Fetch the tickets created by the currently logged-in user
        let userTickets = await Ticket.query()
        .withGraphFetched('[agent.[user], client.[user]]')
        .offset(offset).limit(page_size)
        .orderBy('created_at', 'desc');
        
        let total_pages = Math.ceil(totalTickets / page_size);

        if (Object.keys(req.query).length === 0){

            res.render("dashboard/admin/tickets", {
                userTickets: userTickets,
                search_results: '',
                total_pages: total_pages,
                current_page: page,
                user_role: user_role, 
                current_user: current_user, 
                csrfToken: req.csrfToken()})
            return
        }else if (Object.keys(req.query).length === 1 && req.query.hasOwnProperty('page')){

            res.render("dashboard/admin/tickets", {
                userTickets: userTickets,
                search_results: '',
                total_pages: total_pages,
                current_page: page,
                user_role: user_role, 
                current_user: current_user, 
                csrfToken: req.csrfToken()})
            return
            
        } else {
            const {error, value} = userSearchSchema.validate(req.query)

            if (error){
                res.render("dashboard/admin/tickets", {current_user: current_user, user_role: user_role, error: error.details[0].message, csrfToken: req.csrfToken()})
                return
            }

            const search_results = await Ticket.query()
            .withGraphFetched('[agent.[user], client.[user]]')
            .offset(offset)
            .limit(page_size)
            .where('subject', 'ilike', `%${value.search}%`)
            .orWhere('ticket_id', 'ilike', `%${value.search}%`)
            .orderBy('created_at', 'desc');

            totalTickets = await Ticket.query()
            .where('subject', 'ilike', `%${value.search}%`)
            .orWhere('ticket_id', 'ilike', `%${value.search}%`)
            .resultSize();

            total_pages = Math.ceil(totalTickets / page_size);

            res.render("dashboard/admin/tickets", {
                userTickets: '',
                search_results: search_results,
                total_pages: total_pages,
                current_page: page,
                user_role: user_role, 
                current_user: current_user, 
                csrfToken: req.csrfToken()})

        }

    } catch (err) {
        console.log(err)
        return
    }

}


// get agent emails api
exports.getAgentEmails = async (req, res) => {

    const tag = req.params.tag

    try {
    
        let agents = null;
    
        if (tag === 'payment_issue') {
        agents = await Agent.query().where('department', 'IT').withGraphFetched('user');
        } else if (tag === 'get_invoice' || tag === 'get_refund') {
        agents = await Agent.query().where('department', 'ACCOUNT').withGraphFetched('user');
        } else if (tag === 'cancel_order') {
        agents = await Agent.query().where('department', 'SALES').withGraphFetched('user');
        } else if (tag === 'business') {
        agents = await Agent.query().where('department', 'BUSINESS').withGraphFetched('user');
        } else {
        agents = await Agent.query().where('department', 'GENERAL').withGraphFetched('user');
        }
    
        const agentEmails = agents.map(agent => agent.user.email);
    
        res.json({ agentEmails });
    } catch (err) {
        console.error('Error fetching agent emails:', err);
        res.status(500).json({ error: 'An error occurred while fetching agent emails.' });
    
    }
    };

// create view ticket page for only admin
// method: POST
exports.processAdminTickets = async (req, res) => {

    const user_id = req.session.userId
    const user_role = req.session.role
    const current_user = await User.query().findById(user_id).first()

    // remove the csrf token for the req body
    delete req.body._csrf

    // validate req.body data using the joi validation defined in the model
    const {error, value} = agentCreateTicketSchema.validate(req.body)

    if (error){
        console.error(error)
        res.render('dashboard/dashboard', {
            todaysTicketCount: 0,
            totalTickets: 0,
            totalAgents: 0,
            totalClients: 0,
            openTicketCount: 0,
            closedTicketCount: 0,
            inprogressTicketCount: 0,
            lowPriorityCount: 0,
            mediumPriorityCount: 0,
            highPriorityCount: 0,   
            current_user: current_user, 
            user_role: user_role, 
            error: error.details[0].message,
            csrfToken: req.csrfToken()})
        return
    }

    const client_user_id = await User.query().where("email", value.client_email).first()

    if (!client_user_id){
        res.render('dashboard/dashboard', {
            todaysTicketCount: 0,
            totalTickets: 0,
            totalAgents: 0,
            totalClients: 0,
            openTicketCount: 0,
            closedTicketCount: 0,
            inprogressTicketCount: 0,
            lowPriorityCount: 0,
            mediumPriorityCount: 0,
            highPriorityCount: 0,   
            current_user: current_user, 
            user_role: user_role, 
            error: "This user doesn't exists or is not a client",
            csrfToken: req.csrfToken()})
        return
    }

    const checkClientExists = await Client.query().findById(client_user_id.id).first()

    if (!checkClientExists){
        console.error(error)
        res.render('dashboard/dashboard', {
            todaysTicketCount: 0,
            totalTickets: 0,
            totalAgents: 0,
            totalClients: 0, 
            openTicketCount: 0,
            closedTicketCount: 0,
            inprogressTicketCount: 0,
            lowPriorityCount: 0,
            mediumPriorityCount: 0,
            highPriorityCount: 0, 
            current_user: current_user, 
            user_role: user_role, 
            error: "This client doesn't exists",
            csrfToken: req.csrfToken()})
        return
    }

    let ticket_id = generateRandomTicketId()

    // check if ticket id already exists 
    ticketExists = await Ticket.query().where('ticket_id', ticket_id).first();

    if (ticketExists){
        ticket_id = generateRandomTicketId()
    }

    let assignedAgentId = null;
    let assignedAgent = null;

    const {responseTag, botResponse} = await getResponse(String(value.title))

    console.log(responseTag)
   

    if (responseTag === 'payment_issue' || responseTag == 'payment'){
        const accountsAgents = await Agent.query().where('department', 'IT' );

        if (accountsAgents.length > 0) {
            const randomIndex = Math.floor(Math.random() * accountsAgents.length);
            const randomlySelectedAgent = accountsAgents[randomIndex];
            assignedAgentId = randomlySelectedAgent.user_id;
        }

    } else if (responseTag === 'get_invoice' || responseTag === 'get_refund') {

        const accountsAgents = await Agent.query().where('department', 'ACCOUNT' );

        if (accountsAgents.length > 0) {
            const randomIndex = Math.floor(Math.random() * accountsAgents.length);
            const randomlySelectedAgent = accountsAgents[randomIndex];
            assignedAgentId = randomlySelectedAgent.user_id;
        }

    } else if (responseTag === 'cancel_order' || responseTag === 'place_order' || responseTag === 'web_store' || responseTag === 'items' || responseTag == 'order_tracking' || responseTag === 'cleaning_chemicals' || responseTag === 'maintenance_chemicals'){

        const accountsAgents = await Agent.query().where('department', 'SALES' );

        if (accountsAgents.length > 0) {
            const randomIndex = Math.floor(Math.random() * accountsAgents.length);
            const randomlySelectedAgent = accountsAgents[randomIndex];
            assignedAgentId = randomlySelectedAgent.user_id;
        }

    } else if (responseTag === 'business'){

        const accountsAgents = await Agent.query().where('department', 'BUSINESS' );

        if (accountsAgents.length > 0) {
            const randomIndex = Math.floor(Math.random() * accountsAgents.length);
            const randomlySelectedAgent = accountsAgents[randomIndex];
            assignedAgentId = randomlySelectedAgent.user_id;
        }

    } else {

        const accountsAgents = await Agent.query().where('department', 'GENERAL');

        if (accountsAgents.length > 0) {
            const randomIndex = Math.floor(Math.random() * accountsAgents.length);
            const randomlySelectedAgent = accountsAgents[randomIndex];
            assignedAgentId = randomlySelectedAgent.user_id;
        }
        return
    }


    try {

        assignedAgent = User.query().where("id", assignedAgentId).first()

        await Ticket.query().insert({
            ticket_id: ticket_id, 
            agent_id: assignedAgentId, 
            client_id: client_user_id.id, 
            subject: value.title,
            description: value.desc,
            tag: responseTag,
            priority: value.priority
        })


        const website = `${req.protocol}://${req.get('host')}/dashboard/login/`;


        const mailOptions = mailObject(
            value.client_email,
            "Ticket Created",
            `A ticket has been created for you and this agent, ${assignedAgent.first_name}, has been assigned to the case. Log on to ${website}`,
            )

        transporter.sendMail(mailOptions, function(err, data) {
            if (err) {
                console.log(err)
                res.render("dashboard/admin/tickets", {current_user: current_user, user_role: user_role, error: "Error Occured Sending Email", csrfToken: req.csrfToken()})
                return        
            } else {
            req.flash('success', 'Sucessfully Created Ticket For client')
            res.redirect("/dashboard/admin/ticket")
            return
            }
          });



    } catch (err) {
        console.error(err)
        res.render('dashboard/dashboard', {
            todaysTicketCount: 0,
            totalTickets: 0,
            totalAgents: 0,
            totalClients: 0,
            openTicketCount: 0,
            closedTicketCount: 0,
            inprogressTicketCount: 0,
            lowPriorityCount: 0,
            mediumPriorityCount: 0,
            highPriorityCount: 0, 
            current_user: current_user, 
            user_role: user_role, 
            error: "Error Creating Ticket", 
            csrfToken: req.csrfToken()})
        return
    }

}


exports.processAdminEditTickets = async (req, res) => {
    const user_id = req.session.userId
    const user_role = req.session.role
    const current_user = await User.query().findById(user_id).first()

    // remove the csrf token for the req body
    delete req.body._csrf

    // validate req.body data using the joi validation defined in the model
    const {error, value} = editAdminTicketSchema.validate(req.body)

    if (error){
        console.error(error)
        res.render('dashboard/dashboard', {
            todaysTicketCount: 0,
            totalTickets: 0,
            totalAgents: 0,
            totalClients: 0,
            openTicketCount: 0,
            closedTicketCount: 0,
            inprogressTicketCount: 0,
            lowPriorityCount: 0,
            mediumPriorityCount: 0,
            highPriorityCount: 0, 
            current_user: current_user, 
            user_role: user_role, 
            error: error.details[0].message,
            csrfToken: req.csrfToken()})
        return
    }

    const ticket = await Ticket.query().where("ticket_id", value.ticket_id).first()

    const agent = await User.query().where("email", value.email).first()

    const currentTime = new Date();

    try {

    // Update the ticket priority and agent_id
    await Ticket.query().findById(ticket.id).patch({
        priority: value.priority,
        agent_id: agent.id,
        status: value.status,
        updated_at: currentTime
      });
      
      req.flash('success', 'Sucessfully Updated Ticket For client')
      res.redirect("/dashboard/admin/ticket"); 

    }catch (err){
        console.error(err)
        res.render('dashboard/dashboard', {
            todaysTicketCount: 0,
            totalTickets: 0,
            totalAgents: 0,
            totalClients: 0,
            openTicketCount: 0,
            closedTicketCount: 0,
            inprogressTicketCount: 0,
            lowPriorityCount: 0,
            mediumPriorityCount: 0,
            highPriorityCount: 0, 
            current_user: current_user, 
            user_role: user_role, 
            error: "error occured updating ticket",
            csrfToken: "something went wrong when editing ticket"})
        return
    } 

}


exports.processAgentEditTickets = async (req, res) => {
    const user_id = req.session.userId
    const user_role = req.session.role
    const current_user = await User.query().findById(user_id).first()

    req.body.email = current_user.email

    // remove the csrf token for the req body
    delete req.body._csrf

    // validate req.body data using the joi validation defined in the model
    const {error, value} = editAdminTicketSchema.validate(req.body)

    if (error){
        console.error(error)
        res.render('dashboard/dashboard', {
            todaysTicketCount: 0,
            totalTickets: 0,
            totalAgents: 0,
            totalClients: 0,
            openTicketCount: 0,
            closedTicketCount: 0,
            inprogressTicketCount: 0,
            lowPriorityCount: 0,
            mediumPriorityCount: 0,
            highPriorityCount: 0, 
            current_user: current_user, 
            user_role: user_role, 
            error: error.details[0].message,
            csrfToken: req.csrfToken()})
        return
    }

    const ticket = await Ticket.query().where("ticket_id", value.ticket_id).first()
    

    const agent = await User.query().where("email", value.email).first()

    const currentTime = new Date();

    try {

    // Update the ticket priority and agent_id
    await Ticket.query().findById(ticket.id).patch({
        priority: value.priority,
        agent_id: agent.id,
        status: value.status,
        updated_at: currentTime
      });
      
      req.flash('success', 'Sucessfully Updated Ticket For client')
      res.redirect("/dashboard/agent/ticket"); 

    }catch (err){
        console.error(err)
        res.render('dashboard/dashboard', {
            todaysTicketCount: 0,
            totalTickets: 0,
            totalAgents: 0,
            totalClients: 0,
            openTicketCount: 0,
            closedTicketCount: 0,
            inprogressTicketCount: 0,
            lowPriorityCount: 0,
            mediumPriorityCount: 0,
            highPriorityCount: 0, 
            current_user: current_user, 
            user_role: user_role, 
            error: "error occured updating ticket",
            csrfToken: "something went wrong when editing ticket"})
        return
    } 

}


// create view ticket page for only agent
// method: GET
exports.agentTicketView = async (req, res) => {

    try {

        // page size for pagination
        const page_size = 2;

        // current page
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const offset = (page - 1) * page_size;

        const user_id = req.session.userId
        const user_role = req.session.role
        const current_user = await User.query().findById(user_id).withGraphFetched('agent').first()


        let totalTickets = await Ticket.query().where('agent_id', user_id).resultSize();

        // Fetch the tickets created by the currently logged-in user
        let userTickets = await Ticket.query()
            .where('agent_id', user_id)
            .withGraphFetched('[agent.[user], client.[user]]').offset(offset).limit(page_size).orderBy('created_at', 'desc');

        
        let total_pages = Math.ceil(totalTickets / page_size);

        if (Object.keys(req.query).length === 0){

            res.render("dashboard/agent/tickets", {
                userTickets: userTickets,
                search_results: '',
                total_pages: total_pages,
                current_page: page,
                user_role: user_role, 
                current_user: current_user, 
                csrfToken: req.csrfToken()})
            return
        }else if (Object.keys(req.query).length === 1 && req.query.hasOwnProperty('page')){

            res.render("dashboard/agent/tickets", {
                userTickets: userTickets,
                search_results: '',
                total_pages: total_pages,
                current_page: page,
                user_role: user_role, 
                current_user: current_user, 
                csrfToken: req.csrfToken()})
            return
            
        } else {
            const {error, value} = userSearchSchema.validate(req.query)

            if (error){
                res.render("dashboard/agent/tickets", {current_user: current_user, user_role: user_role, error: error.details[0].message, csrfToken: req.csrfToken()})
                return
            }

            const search_results = await Ticket.query()
            .where('agent_id', user_id)
            .withGraphFetched('[agent.[user], client.[user]]')
            .offset(offset)
            .limit(page_size)
            .where('subject', 'ilike', `%${value.search}%`)
            .orWhere('ticket_id', 'ilike', `%${value.search}%`)
            .orderBy('created_at', 'desc');

            totalTickets = await Ticket.query()
            .findById(user_id)
            .where('subject', 'ilike', `%${value.search}%`)
            .orWhere('ticket_id', 'ilike', `%${value.search}%`)
            .resultSize();

            total_pages = Math.ceil(totalTickets / page_size);

            res.render("dashboard/agent/tickets", {
                userTickets: '',
                search_results: search_results,
                total_pages: total_pages,
                current_page: page,
                user_role: user_role, 
                current_user: current_user, 
                csrfToken: req.csrfToken()})

        }

    } catch (err) {
        console.log(err)
        return
    }

}

// create view ticket page for agent and admin
// method: POST
exports.processAgentTickets = async (req, res) => {

    const user_id = req.session.userId
    const user_role = req.session.role
    const current_user = await User.query().findById(user_id).first()

    // remove the csrf token for the req body
    delete req.body._csrf

    // validate req.body data using the joi validation defined in the model
    const {error, value} = agentCreateTicketSchema.validate(req.body)

    if (error){
        console.error(error)
        res.render('dashboard/dashboard', {
            todaysTicketCount: 0,
            totalTickets: 0,
            totalAgents: 0,
            totalClients: 0,
            openTicketCount: 0,
            closedTicketCount: 0,
            inprogressTicketCount: 0,
            lowPriorityCount: 0,
            mediumPriorityCount: 0,
            highPriorityCount: 0,  
            current_user: current_user, 
            user_role: user_role, 
            error: error.details[0].message,
            csrfToken: req.csrfToken()})
        return
    }

    const client_user_id = await User.query().where("email", value.client_email).first()

    if (!client_user_id){
        res.render('dashboard/dashboard', {
            todaysTicketCount: 0,
            totalTickets: 0,
            totalAgents: 0,
            totalClients: 0,
            openTicketCount: 0,
            closedTicketCount: 0,
            inprogressTicketCount: 0,
            lowPriorityCount: 0,
            mediumPriorityCount: 0,
            highPriorityCount: 0, 
            current_user: current_user, 
            user_role: user_role, 
            error: "This user doesn't exists or is not a client",
            csrfToken: req.csrfToken()})
        return
    }

    const checkClientExists = await Client.query().findById(client_user_id.id).first()

    if (!checkClientExists){
        console.error(error)
        res.render('dashboard/dashboard', {
            todaysTicketCount: 0,
            totalTickets: 0,
            totalAgents: 0,
            totalClients: 0,
            openTicketCount: 0,
            closedTicketCount: 0,
            inprogressTicketCount: 0,
            lowPriorityCount: 0,
            mediumPriorityCount: 0,
            highPriorityCount: 0,  
            current_user: current_user, 
            user_role: user_role, 
            error: "This client doesn't exists",
            csrfToken: req.csrfToken()})
        return
    }

    let ticket_id = generateRandomTicketId()

    // check if ticket id already exists 
    ticketExists = await Ticket.query().where('ticket_id', ticket_id).first();

    if (ticketExists){
        ticket_id = generateRandomTicketId()
    }

    let assignedAgentId = null;
    let assignedAgent = null;

    const {responseTag, botResponse} = await getResponse(String(value.title))
    

    if (responseTag === 'payment_issue' || responseTag == 'payment'){
        const accountsAgents = await Agent.query().where('department', 'IT' );

        if (accountsAgents.length > 0) {
            const randomIndex = Math.floor(Math.random() * accountsAgents.length);
            const randomlySelectedAgent = accountsAgents[randomIndex];
            assignedAgentId = randomlySelectedAgent.user_id;
        }

    } else if (responseTag === 'get_invoice' || responseTag === 'get_refund') {

        const accountsAgents = await Agent.query().where('department', 'ACCOUNT' );

        if (accountsAgents.length > 0) {
            const randomIndex = Math.floor(Math.random() * accountsAgents.length);
            const randomlySelectedAgent = accountsAgents[randomIndex];
            assignedAgentId = randomlySelectedAgent.user_id;
        }

    } else if (responseTag === 'cancel_order' || responseTag === 'place_order' || responseTag === 'web_store' || responseTag === 'items' || responseTag == 'order_tracking' || responseTag === 'cleaning_chemicals' || responseTag === 'maintenance_chemicals'){

        const accountsAgents = await Agent.query().where('department', 'SALES' );

        if (accountsAgents.length > 0) {
            const randomIndex = Math.floor(Math.random() * accountsAgents.length);
            const randomlySelectedAgent = accountsAgents[randomIndex];
            assignedAgentId = randomlySelectedAgent.user_id;
        }

    } else if (responseTag === 'business'){

        const accountsAgents = await Agent.query().where('department', 'BUSINESS' );

        if (accountsAgents.length > 0) {
            const randomIndex = Math.floor(Math.random() * accountsAgents.length);
            const randomlySelectedAgent = accountsAgents[randomIndex];
            assignedAgentId = randomlySelectedAgent.user_id;
        }

    } else {

        const accountsAgents = await Agent.query().where('department', 'GENERAL');

        if (accountsAgents.length > 0) {
            const randomIndex = Math.floor(Math.random() * accountsAgents.length);
            const randomlySelectedAgent = accountsAgents[randomIndex];
            assignedAgentId = randomlySelectedAgent.user_id;
        }
        return
    }


    try {

        assignedAgent = User.query().where("id", assignedAgentId).first()

        await Ticket.query().insert({
            ticket_id: ticket_id, 
            agent_id: assignedAgentId, 
            client_id: client_user_id.id, 
            subject: value.title,
            description: value.desc,
            tag: responseTag,
            priority: value.priority
        })


        const website = `${req.protocol}://${req.get('host')}/dashboard/login/`;

        const mailOptions = mailObject(
            value.client_email,
            "Ticket Created",
            `A ticket has been created for you and this agent, ${assignedAgent.first_name}, has been assigned to the case. Log on to ${website}`,
            )

        transporter.sendMail(mailOptions, function(err, data) {
            if (err) {
                console.log(err)
                res.render("dashboard/agent/tickets", {current_user: current_user, user_role: user_role, error: "Error Occured Sending Email", csrfToken: req.csrfToken()})
                return        
            } else {
                req.flash('success', 'Sucessfully created the Ticket For client')
                res.redirect("/dashboard/agent/ticket"); 
            return
            }
          });


    } catch (err) {
        console.error(err)
        res.render('dashboard/dashboard', {
            todaysTicketCount: 0,
            totalTickets: 0,
            totalAgents: 0,
            totalClients: 0,
            openTicketCount: 0,
            closedTicketCount: 0,
            inprogressTicketCount: 0,
            lowPriorityCount: 0,
            mediumPriorityCount: 0,
            highPriorityCount: 0, 
            current_user: current_user, 
            user_role: user_role, 
            error: "Error Creating Ticket", 
            csrfToken: req.csrfToken()})
        return
    }


}

// Report View For both Admin and Agent
// method: GET
exports.reports = async (req, res) => {

    const user_id = req.session.userId
    const user_role = req.session.role
    const current_user = await User.query().findById(user_id).first()

    res.render('dashboard/reports', {current_user: current_user, user_role: user_role, csrfToken: req.csrfToken()})
    
}


exports.getReportStatus = async (req, res) => {
    const selectedStatus = req.params.ticketStatus

    console.log(selectedStatus)

    try {

        if (selectedStatus === 'RATINGS'){

            const agentTicketCounts = await Agent.query()
            .select('users.first_name', 'users.last_name')
            .join('users', 'agents.user_id', '=', 'users.id')
            .join('tickets', 'tickets.agent_id', '=', 'agents.user_id')
            .avg('tickets.ratings as avg_ratings')
            .where('tickets.status', "CLOSED")
            .groupBy('users.first_name', 'users.last_name');
      
          const formattedCounts = agentTicketCounts.reduce((counts, agent) => {
            const fullName = `${agent.first_name} ${agent.last_name}`;
            counts[fullName] = parseInt(agent.avg_ratings);
            return counts;
          }, {});

          console.log(agentTicketCounts)
   
          console.log(formattedCounts)
      
          res.json({ ticketsData: formattedCounts });


        } else {

        const agentTicketCounts = await Agent.query()
        .select('users.first_name', 'users.last_name')
        .join('users', 'agents.user_id', '=', 'users.id')
        .join('tickets', 'tickets.agent_id', '=', 'agents.user_id')
        .count('tickets.id as count')
        .where('tickets.status', selectedStatus)
        .groupBy('users.first_name', 'users.last_name');
  
      const formattedCounts = agentTicketCounts.reduce((counts, agent) => {
        const fullName = `${agent.first_name} ${agent.last_name}`;
        counts[fullName] = parseInt(agent.count);
        return counts;
      }, {});

      console.log(agentTicketCounts)
      console.log(formattedCounts)
  
      res.json({ ticketsData: formattedCounts });

    }
    } catch (error) {
      console.error('Error fetching agent ticket counts:', error);
      res.status(500).json({ error: 'An error occurred while fetching agent ticket counts' });
    }
  };


exports.getAgentTicketRatings = async (req, res) => {
    
}











    















