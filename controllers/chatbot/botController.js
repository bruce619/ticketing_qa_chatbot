const { getResponse } = require("../../models/chatbot_model/chatbot")
const Conversation = require("../../models/conversation")
const Ticket = require("../../models/ticket")
const { getDateTimestamp } = require("../../utility/utils")
const { chatMessage } = require("../../utility/validations")


exports.HomeView = async (req, res) => {
    res.render('chatbot/index.ejs', {})
}

exports.processbotResponseHomeView = async (req, res) =>{
    try {

        let {responseTag, botResponse} = await getResponse(req.body.userInput)

        if (responseTag === "datetime"){
            botResponse = botResponse + getDateTimestamp()
        }

        res.json({responseTag, botResponse})

    } catch (e) {
        console.log(e);
    }
}



exports.getConversations = async (req, res) => {
    const ticketId = req.params.ticketId;
    const userId = req.session.userId
    const userRole = req.session.role; // extract the user role from token
  
    try {

        // use the param ticketId to get the actually ticket id foreignkey
        const ticket_id = await Ticket.query().where('ticket_id', ticketId).first()

        if (!ticket_id) {
            res.status(500).json({ error: 'An error occurred while retrieving conversation.' });
        }


        let conversation;
        
        if (userRole === 'client') {
          // Retrieve conversation data for a client based on the ticket ID
          conversation = await Conversation.query()
            .where('ticket_id', ticket_id.id)
            .where('user_id', userId) // Assuming you have user information in req.user
            .orderBy('sent_at', 'asc');
        } else if (userRole === 'agent' || userRole === 'admin') {
          // Retrieve conversation data for an agent or admin based on the ticket ID
          conversation = await Conversation.query()
            .where('ticket_id', ticket_id.id)
            .orderBy('sent_at', 'asc');
        }

    // Add user_role to each conversation item before sending in the response
    const conversationWithUserRole = conversation.map(item => ({
        ...item,
        user_role: userRole,
      }));

      console.log(conversationWithUserRole)
  
      res.json(conversationWithUserRole);

    } catch (error) {
      console.error('Error retrieving conversation:', error);
      res.status(500).json({ error: 'An error occurred while retrieving conversation.' });
    }
  };


exports.sendMessage = async (req, res) => {

    // remove the csrf token for the req body
    delete req.body._csrf

    if (!('image' in req.body)){
        req.body.image = null;
      }else{
        req.body.image = req.body.image
      }

    const userRole = req.session.role
    const user = req.session.userId

    const {error, value} = chatMessage.validate(req.body)

    if (error){
        console.log(error)
        res.status(500).json({ error: 'An error occurred while saving conversation.' });
    }

    const getTicket = await Ticket.query().where('ticket_id', value.ticketId).first()

    if (!getTicket){
        res.status(500).json({ error: 'An error occurred while saving conversation.' });
    }

    const ticket_id = getTicket.id

    try {

        await Conversation.query().insert({message: value.message, ticket_id: ticket_id, user_id: user, image: value.image})


        let conversation;
        
        if (userRole === 'client') {
          // Retrieve conversation data for a client based on the ticket ID
          conversation = await Conversation.query()
            .where('ticket_id', ticket_id)
            .where('user_id', user) // Assuming you have user information in req.user
            .orderBy('sent_at', 'asc');
        } else if (userRole === 'agent' || userRole === 'admin') {
          // Retrieve conversation data for an agent or admin based on the ticket ID
          conversation = await Conversation.query()
            .where('ticket_id', ticket_id)
            .orderBy('sent_at', 'asc');
        }

    // Add user_role to each conversation item before sending in the response
    const conversationWithUserRole = conversation.map(item => ({
        ...item,
        user_role: userRole,
      }));

      console.log(conversationWithUserRole)
  
      res.json(conversationWithUserRole);

    } catch (err){
        console.log(err)
        res.status(500).json({ error: 'An error occurred while saving conversation.' });
        return
    }






};