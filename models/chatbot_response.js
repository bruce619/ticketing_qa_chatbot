const path = require('path')
const fs = require('fs')
const { promisify } = require('util');
const { loadModel, padSequences, preprocessDFInputs} = require('./helpers');
const readFile = promisify(fs.readFile);
const {DataFrame} = require('dataframe-js');
const dfd = require('danfojs-node')
const tf = require('@tensorflow/tfjs-node');
const { Tokenizer } = require('tf_node_tokenizer');
const { removePunctuations } = require('../utility/utils');

// // label encoder


async function getChatbotResponse (textInput){

    const JsonDataFilePath = path.join(__dirname, '../data.json');
    // Load the json training data
    const readDataDict = await readFile(JsonDataFilePath, 'utf-8');
    const dataDict = JSON.parse(readDataDict);
    // load model
    const model = await loadModel(tf);
    // initialize tokenizer
    const tokenizer = new Tokenizer({num_words: 2000});
    // load encoder
    const encode = new dfd.LabelEncoder()


    // get response, tokenizer, and input_shape of 
    const tags = [];
    const inputs = [];
    const responses = {};

    for (const intent of dataDict['intents']) {
        responses[intent['tag']] = intent['responses'];
        for (const lines of intent['input']) {
            inputs.push(lines);
            tags.push(intent['tag']);
        }
    }

    const dataFrame = new DataFrame({ inputs, tags }).shuffle()

    // Remove punctuations and clean the text
    const cleanedDataFrame = preprocessDFInputs(dataFrame);
    const texts = cleanedDataFrame.select('inputs').toArray().flat(1)
    const tags_ = cleanedDataFrame.select('tags').toArray().flat(1)

    // // tokenize inputs and get input shape
    tokenizer.fitOnTexts(texts)
    const train = tokenizer.textsToSequences(texts)
    const x_train = padSequences(train)
    const y_train = encode.fitTransform(tags_)
    const shape = [x_train.length, x_train[0].length];
    const input_shape = shape[1];

    console.log("input_shape", input_shape)

    // Preprocess the input text
    const texts_p = []
    const cleanedTextInput = removePunctuations(textInput);
    texts_p.push(cleanedTextInput)
    const inputToSequence = tokenizer.textsToSequences(texts_p)
    const paddedSequences = padSequences(inputToSequence, input_shape)
    const reshapePaddedSequences = paddedSequences.flat()
    console.log("reshapePaddedSequences", reshapePaddedSequences)
    const tensor = tf.tensor2d([reshapePaddedSequences])
    console.log(tensor)

    // model predict
    const output = model.predict(tensor);
    output.print()

    // Get the predicted tag and response
    const predictedTagIndex = output.argMax().dataSync()[0];
    // Convert the predicted index to the corresponding tag
    const responseTag = encode.inverseTransform([predictedTagIndex])[0];
    console.log("tag: ", responseTag)
    const responsesArray = responses[responseTag];
    console.log(responsesArray)
    const randomResponse = responsesArray[Math.floor(Math.random() * responsesArray.length)];
    /* Randomly select a response for the predicted tag */;
    console.log("Bot:", randomResponse);

    return { tag: responseTag, botResponse: randomResponse };

}


getChatbotResponse(JsonDataFilePath, "Hi")


module.exports = {
    getChatbotResponse
}

