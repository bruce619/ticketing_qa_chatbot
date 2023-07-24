const { getResponse } = require("../../models/chatbot_model/chatbot")


exports.botHomeView = async (req, res) => {
    res.render('chatbot/index.ejs', {})
}

exports.botHomePost = async (req, res) =>{
    try {

        const {responseTag, botResponse} = await getResponse(req.body.userInput)
        res.json({responseTag, botResponse})

    } catch (e) {
        console.log(e);
    }
}