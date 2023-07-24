const tf = require('@tensorflow/tfjs-node');
const path = require('path')
const fs = require('fs')
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const { removePunctuations } = require('../../utility/utils');
const { padSequences, loadModel } = require('./helpers');
const { tokenizerFromJson } = require('tf_node_tokenizer');



async function chatBot(textInput, model, tokenizer, input_shape, responses, encoder_classes){

    // Preprocess the input text
    const cleanedTextInput = removePunctuations(textInput);
    const texts_p = [cleanedTextInput]
    const inputToSequence = tokenizer.textsToSequences(texts_p)
    const tensor = padSequences(inputToSequence, input_shape)

    // model predict
    const output = await model.predict(tensor);

    // Get the predicted tag and response
    const predictTagIndex = await output.argMax(-1).arraySync()[0]

    // Convert the predicted index to the corresponding tag
    const responseTag = encoder_classes[predictTagIndex]

    const responsesArray = responses[responseTag];

    const botResponse = responsesArray[Math.floor(Math.random() * responsesArray.length)];
    /* Randomly select a response for the predicted tag */;

    return { responseTag, botResponse };

}


async function getResponse(textInput){

    const model = await loadModel()

    const loadModelInfoPath = path.join(__dirname, './model_obj.json');
    const readModelObj = await readFile(loadModelInfoPath);
    const {tokenizer, input_shape, encoder_classes, responses} = JSON.parse(readModelObj);

    const loadedTokenizer = tokenizerFromJson(tokenizer);

    const {responseTag, botResponse} = await chatBot(textInput, model, loadedTokenizer, input_shape, responses, encoder_classes)

    return {responseTag, botResponse}

}

(async () => {

    const textInput = "Tell me about your products"

    const { responseTag, botResponse } = await getResponse(textInput)
    console.log(responseTag)
    console.log(botResponse)

})()

