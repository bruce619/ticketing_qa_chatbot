const { getResponse } = require("../../models/chatbot_model/chatbot")


exports.HomeView = async (req, res) => {
    res.render('chatbot/index.ejs', {})
}

exports.processbotResponseHomeView = async (req, res) =>{
    try {

        const {responseTag, botResponse} = await getResponse(req.body.userInput)
        res.json({responseTag, botResponse})

    } catch (e) {
        console.log(e);
    }
}