const { mailObject, transporter } = require("../../config/email_config")
const Agent = require("../../models/agent")
const { getResponse } = require("../../models/chatbot_model/chatbot")
const Ticket = require("../../models/ticket")
const User = require("../../models/user")
const { generateRandomTicketId } = require("../../utility/utils")
const { clientProfileUpdateSchema, userSearchSchema, clientCreateTicketSchema, rateTicketSchema } = require("../../utility/validations")

// Client view ticket page
// method: GET
exports.clientTicketView = async (req, res) => {
    try {

        // page size for pagination
        const page_size = 2;

        // current page
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const offset = (page - 1) * page_size;

        const user_id = req.session.userId
        const user_role = req.session.role
        const current_user = await User.query().findById(user_id).withGraphFetched('client').first()


        let totalTickets = await Ticket.query().where('client_id', user_id).resultSize();

        // Fetch the tickets created by the currently logged-in user
        let userTickets = await Ticket.query()
            .where('client_id', user_id)
            .withGraphFetched('[agent.[user], client.[user]]').offset(offset).limit(page_size).orderBy('created_at', 'desc');

        
        let total_pages = Math.ceil(totalTickets / page_size);

        if (Object.keys(req.query).length === 0){

            res.render("dashboard/client/tickets", {
                userTickets: userTickets,
                search_results: '',
                total_pages: total_pages,
                current_page: page,
                user_role: user_role, 
                current_user: current_user, 
                csrfToken: req.csrfToken()})
            return
        }else if (Object.keys(req.query).length === 1 && req.query.hasOwnProperty('page')){

            res.render("dashboard/client/tickets", {
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
                res.render("dashboard/client/tickets", {current_user: current_user, user_role: user_role, error: error.details[0].message, csrfToken: req.csrfToken()})
                return
            }

            const search_results = await Ticket.query()
            .where('client_id', user_id)
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

            res.render("dashboard/client/tickets", {
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


// Client Process Ticket: For client to create ticket
// method: POST
exports.processClientTickets = async (req, res) => {

    const user_id = req.session.userId
    const user_role = req.session.role
    const current_user = await User.query().findById(user_id).first()

    // remove the csrf token for the req body
    delete req.body._csrf

    // validate req.body data using the joi validation defined in the model
    const {error, value} = clientCreateTicketSchema.validate(req.body)

    if (error){
        res.render("dashboard/client/tickets", {
            userTickets: '',
            search_results: '',
            total_pages: 1,
            current_page: 1,
            current_user: current_user, 
            user_role: user_role, 
            error: error.details[0].message, 
            csrfToken: req.csrfToken()})
        return
    }

    let ticket_id = generateRandomTicketId()

    // check if ticket id already exists 
    ticketExists = await Ticket.query().where('ticket_id', ticket_id).first();

    if (ticketExists){
        ticket_id = generateRandomTicketId()
    }

    let priority = '';
    let assignedAgentId = null;
    let assignedAgent = null;

    const {responseTag, botResponse} = await getResponse(String(value.title))

    if (responseTag === 'payment_issue' || responseTag == 'payment'){
        priority = 'HIGH'
        const accountsAgents = await Agent.query().where('department', 'IT');

        if (accountsAgents.length > 0) {
            const randomIndex = Math.floor(Math.random() * accountsAgents.length);
            const randomlySelectedAgent = accountsAgents[randomIndex];
            assignedAgentId = randomlySelectedAgent.user_id;
        }

    } else if (responseTag === 'get_invoice' || responseTag === 'get_refund') {
        priority = 'MEDIUM'

        const accountsAgents = await Agent.query().where('department', 'ACCOUNT');

        if (accountsAgents.length > 0) {
            const randomIndex = Math.floor(Math.random() * accountsAgents.length);
            const randomlySelectedAgent = accountsAgents[randomIndex];
            assignedAgentId = randomlySelectedAgent.user_id;
        }

    } else if (responseTag === 'cancel_order' || responseTag === 'place_order' || responseTag === 'web_store' || responseTag === 'items' || responseTag == 'order_tracking' || responseTag === 'cleaning_chemicals' || responseTag === 'maintenance_chemicals'){

        priority = 'MEDIUM'

        const accountsAgents = await Agent.query().where('department', 'SALES');

        if (accountsAgents.length > 0) {
            const randomIndex = Math.floor(Math.random() * accountsAgents.length);
            const randomlySelectedAgent = accountsAgents[randomIndex];
            assignedAgentId = randomlySelectedAgent.user_id;
        }

    } else if (responseTag === 'business'){

        priority = 'MEDIUM'

        const accountsAgents = await Agent.query().where('department', 'BUSINESS');

        if (accountsAgents.length > 0) {
            const randomIndex = Math.floor(Math.random() * accountsAgents.length);
            const randomlySelectedAgent = accountsAgents[randomIndex];
            assignedAgentId = randomlySelectedAgent.user_id;
        }

    } else {
        priority = 'LOW'

        const accountsAgents = await Agent.query().where('department', 'GENERAL');

        if (accountsAgents.length > 0) {
            const randomIndex = Math.floor(Math.random() * accountsAgents.length);
            const randomlySelectedAgent = accountsAgents[randomIndex];
            assignedAgentId = randomlySelectedAgent.user_id;
        }
        return
    }

    try {

        assignedAgent = User.query().findById(assignedAgentId).first()

        await Ticket.query().insert({
            ticket_id: ticket_id, 
            agent_id: assignedAgentId, 
            client_id: user_id, 
            subject: value.title,
            description: value.desc,
            tag: responseTag,
            priority: priority
        })

        const website = `${req.protocol}://${req.get('host')}/dashboard/login/`;

        const mailOptions = mailObject(
            current_user.email,
            "Ticket Created",
            `This agent, ${assignedAgent.first_name}, has been assigned to your case log on to ${website}`,
            )

        transporter.sendMail(mailOptions, function(err, data) {
            if (err) {
                console.log(err)
                res.render("dashboard/client/tickets", {current_user: current_user, user_role: user_role, error: "Error Occured Sending Email To You", csrfToken: req.csrfToken()})
                return        
            } else {
            req.flash('success', 'Sucessfully Created Ticket')
            req.flash('info', 'An agent has been asigned to resolve your case')
            res.redirect("/dashboard/client/ticket")
              return
            }
          });

    } catch (err) {
        console.log(err)
        res.render("dashboard/client/tickets", {current_user: current_user, user_role: user_role, error: "Error Creating Ticket", csrfToken: req.csrfToken()})
        return
    }


} 


// client profile view
// method: GET
exports.clientProfileView = async (req, res) =>{
    try{

        const user_id = req.session.userId
        const user_role = req.session.role
        const current_user = await User.query().findById(user_id).withGraphFetched('client').first()

    res.render("dashboard/client/editprofile", {current_user: current_user, user_role: user_role, csrfToken: req.csrfToken()})
    } catch (err) {
        console.log(err)
        return
    }
}

// process the client profile update
// method: GET
exports.processClientProfileUpdate = async (req, res) => {

    delete req.body._csrf

    if (!('two_fa_enabled' in req.body)){
        req.body.two_fa_enabled = false;
      }else{
        req.body.two_fa_enabled = Boolean(req.body.two_fa_enabled)
      }


      const user_id = req.session.userId
      const user_role = req.session.role
      const current_user = await User.query().findById(user_id).withGraphFetched('client').first()


      const {error, value} = clientProfileUpdateSchema.validate(req.body)

      if (error){
        res.render("dashboard/client/tickets", {current_user: current_user, user_role: user_role, error: error.details[0].message, csrfToken: req.csrfToken()})
        return
    }

    try {

        current_user.first_name = value.first_name
        current_user.last_name = value.last_name
        current_user.email = value.email
        current_user.two_fa_enabled = value.two_fa_enabled

        // Update the agent fields
        if (current_user.client) {
            current_user.client.location = value.location;
            current_user.client.phone = value.phone;
        }

        // Save the changes to the user and agent tables
        await current_user.$query().patch();

        if (current_user.client) {
        await current_user.client.$query().patch();
        }

        req.flash('success', 'Sucessfully updated your profile')
        res.redirect('/dashboard/client/ticket')


    } catch (err) {
        console.log(`Error Updating Profile ${err}`)
        res.render('dashboard/editprofile', {current_user: current_user, user_role: user_role, error: "An error occurred while updating profile", csrfToken: req.csrfToken()})
        return
    }

}




// rate ticket
// method: POST
exports.rateTicket = async (req, res) => {

    delete req.body._csrf

    const new_req_obj = {...req.body, ...req.params}

    const user_id = req.session.userId
    const user_role = req.session.role
    const current_user = await User.query().findById(user_id).withGraphFetched('client').first()


    const {error, value} = rateTicketSchema.validate(new_req_obj)

    if (error){
        console.log(error)
      res.render("dashboard/client/tickets", {current_user: current_user, user_role: user_role, error: error.details[0].message, csrfToken: req.csrfToken()})
      return
  }

  const rating = parseInt(value.rating)

  try {

    await Ticket.query().where("ticket_id", value.ticketId).patch({ratings: rating})

    const mailOptions = mailObject(
        current_user.email,
        "Ratings",
        `Thank you for rating this agent. If you have any other issue do't hesitate to raise a ticket`,
        )

    transporter.sendMail(mailOptions, function(err, data) {
        if (err) {
            console.log(err)
            res.render("dashboard/client/tickets", {current_user: current_user, user_role: user_role, error: "error sending an email to client", csrfToken: req.csrfToken()})
            return        
        } else {
        req.flash('success', 'Sucessfully rated ticket')
        res.redirect('/dashboard/client/ticket')
        return
        }
      });

  } catch (err) {
    console.log(err)
    res.render("dashboard/client/tickets", {current_user: current_user, user_role: user_role, error: "error occured when rating ticket", csrfToken: req.csrfToken()})
    return

  }

  
    
}