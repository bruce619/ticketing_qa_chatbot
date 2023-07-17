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
const y_train = tf.tensor1d(encode.fitTransform(tags_))

// get the size of unique target data y_train
const { values, indices } = tf.unique(y_train)

const output_length = values.size

const vocab_size = Object.keys(tokenizer.word_index).length

module.exports = {
    responses,
    x_train,
    y_train,
    encode,
    output_length,
    vocab_size,
    input_shape,
    tokenizer
}