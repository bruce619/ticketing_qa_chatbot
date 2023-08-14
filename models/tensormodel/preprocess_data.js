const path = require('path')
const fs = require('fs')
const {DataFrame} = require('dataframe-js');
const { Tokenizer } = require('tf_node_tokenizer');
const { preprocessDFInputs, padSequences} = require('./helpers');
const dfd = require('danfojs-node')
const tf = require('@tensorflow/tfjs-node');


// // load encoder
const encode = new dfd.LabelEncoder()
// load training data
const jsonDataFilePath = path.join(__dirname, '../../data.json');
const jsonData = fs.readFileSync(jsonDataFilePath, 'utf-8');
const dataDict = JSON.parse(jsonData);

// initialize tokenizer
const tokenizer = new Tokenizer({num_words: 2000});

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

// Remove punctuations and clean the text
const dataFrame = new DataFrame({ inputs, tags }).shuffle()
const cleanedDataFrame = preprocessDFInputs(dataFrame);
const texts_obj = cleanedDataFrame.select('inputs').toCollection()
const texts = texts_obj.map(t => t['inputs']);
const tags_obj = cleanedDataFrame.select('tags').toCollection()
const tags_ = tags_obj.map(t => t['tags'])

// tokenize inputs and get input shape
tokenizer.fitOnTexts(texts)
const train = tokenizer.textsToSequences(texts)
const x_train = padSequences(train)
const input_shape = x_train.shape[1]

// encoding the outputs
const le = encode.fitTransform(tags_)
const y_train = tf.tensor1d(le);

const keysArray = Object.keys(encode.classes);
const encoder_classes = keysArray.map((key) => key);
const output_length = encode.nClasses

// get the size of unique target data y_train
// const { values, indices } = tf.unique(y_train)

// const output_length = values.size

const vocab_size = Object.keys(tokenizer.word_index).length


async function saveModelInfoToFile() {

    // store objects
    const model_info = {
        tokenizer: tokenizer.toJson(),
        input_shape: input_shape,
        encoder_classes: encoder_classes,
        responses: responses
    }

    // Convert the model_info object to JSON format
    const model_info_json = JSON.stringify(model_info, null, 2);

    // Define the file path where you want to save the JSON file
    const filePath = './model_obj.json';

    // Write the JSON data to the file
    fs.writeFile(filePath, model_info_json, (err) => {
    if (err) {
        console.error('Error writing JSON file:', err);
    } else {
        console.log('Model information has been saved to model_info.json.');
    }
    });

}

module.exports = {
    responses,
    x_train,
    y_train,
    encode,
    output_length,
    vocab_size,
    input_shape,
    tokenizer,
    saveModelInfoToFile
}