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
    const userId = req.session.userId
    const userRole = req.session.role; // extract the user role from token
  
    try {

        const ticketId = req.params.ticketId;

        // use the param ticketId to get the actually ticket id foreignkey
        const ticket_id = await Ticket.query().where('ticket_id', ticketId).first()

        console.log(`ticket id: ${ticket_id.id}`)


        console.log(`ticketId: ${ticketId}`)

        if (!ticket_id) {
            res.status(500).json({ error: 'An error occurred while retrieving conversation.' });
        }


        let conversation = await Conversation.query().where('ticket_id', ticket_id.id).orderBy('sent_at', 'asc');
  
      res.json(conversation);

    } catch (error) {
      console.error('Error retrieving conversation:', error);
      res.status(500).json({ error: 'An error occurred while retrieving conversation.' });
    }
  };


exports.sendMessage = async (req, res) => {

    if (req.file === undefined){
        req.file = {}
      }


    if ('filename' in req.file){
    const image = '/' + 'uploads' + '/' + req.file.filename
    req.body.image = image
    }else {
        req.body.image = null
    }

    // remove the csrf token for the req body
    delete req.body._csrf

    const userRole = req.session.role
    const user = req.session.userId

    const {error, value} = chatMessage.validate(req.body)

    if (error){
        console.log(error)
        res.status(500).json({ error: 'An error occurred while saving conversation.' });
        return
    }


    const getTicket = await Ticket.query().where('ticket_id', value.ticketId).first()

    if (!getTicket){
        res.status(500).json({ error: 'An error occurred while saving conversation.' });
        return
    }

    if (getTicket.status === "CLOSED"){
        res.status(500).json({ error: "Ticket is has been closed you can't send a message." });
        return
    }


    const ticket_id = getTicket.id

    try {

        await Conversation.query().insert({message: value.message, ticket_id: ticket_id, user_id: user, user_role: userRole, image: value.image})


        let conversation = await Conversation.query().where('ticket_id', ticket_id).orderBy('sent_at', 'asc');
        
  
        res.json(conversation);

    } catch (err){
        console.log(err)
        res.status(500).json({ error: 'An error occurred while saving conversation.' });
        return
    }


};