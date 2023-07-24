const path = require('path')
const fs = require('fs')
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const { padSequences, loadModel } = require('./helpers');
const { Tokenizer } = require('tf_node_tokenizer');
const { removePunctuations } = require('../../utility/utils');

function tokenizerFromJson(tokenizer){
    const newTokenizer = new Tokenizer();
    const parseStringTokenizer = JSON.parse(tokenizer)
    newTokenizer.num_words = parseStringTokenizer.config.num_words
    newTokenizer.filters = parseStringTokenizer.config.filters
    newTokenizer.lower = parseStringTokenizer.config.lower
    newTokenizer.oov_token = parseStringTokenizer.config.oov_token
    newTokenizer.index_word = JSON.parse(parseStringTokenizer.config.index_word)
    newTokenizer.word_index = JSON.parse(parseStringTokenizer.config.word_index)
    newTokenizer.word_counts = JSON.parse(parseStringTokenizer.config.word_counts)
    return newTokenizer
}


async function preprocessTextInput(textInput, model, loadedTokenizer, input_shape, responses, encoder_classes){

        // Preprocess the input text
        const cleanedTextInput = removePunctuations(textInput);
        const texts_p = [cleanedTextInput]
        const inputToSequence = loadedTokenizer.textsToSequences(texts_p)
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

    const loadModelInfoPath = path.join(__dirname, '../../model_info.json');
    const readModelInfo = await readFile(loadModelInfoPath);
    const { tokenizer, input_shape, responses, encoder_classes } = JSON.parse(readModelInfo);

    const loadedTokenizer = tokenizerFromJson(tokenizer)

    const {responseTag, botResponse} = await preprocessTextInput(textInput, model, loadedTokenizer, input_shape, responses, encoder_classes)

    return {responseTag, botResponse}

}

module.exports = {
    getResponse
}