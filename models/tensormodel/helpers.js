const path = require('path')
const tf = require('@tensorflow/tfjs-node');


const modelPath = path.join(__dirname, '../../chatbotmodel') // path to the model directory 


function padSequences(sequences, maxlen = null, dtype = 'int32', padding = 'pre', truncating = 'pre', value = 0) {
  let actualMaxlen = maxlen;
  if (maxlen === null) {
    // Calculate the maximum length dynamically
    actualMaxlen = sequences.reduce((maxLen, sequence) => Math.max(maxLen, sequence.length), 0);
  }

  const paddedSequences = [];
  for (const sequence of sequences) {
    let paddedSequence = Array.from(sequence);
    if (padding === 'pre') {
      while (paddedSequence.length < actualMaxlen) {
        paddedSequence.unshift(value);
      }
    } else {
      while (paddedSequence.length < actualMaxlen) {
        paddedSequence.push(value);
      }
    }
    if (truncating === 'pre') {
      paddedSequence = paddedSequence.slice(0, actualMaxlen);
    } else {
      paddedSequence = paddedSequence.slice(-actualMaxlen);
    }
    paddedSequences.push(paddedSequence);
  }
  return tf.tensor2d(paddedSequences, [paddedSequences.length, actualMaxlen], dtype);
}


function preprocessDFInputs(dataFrame){
  // remove punctuation and lower the case
  return dataFrame.withColumn('inputs', (row) => row.get('inputs').toLowerCase().replace(/[^\w\s]/g, ''))
}


async function loadModel(){
  const modelURL = 'file://../../jschatbotmodel/model.json'
  console.log("loading model ...")
  const model = await tf.loadLayersModel(modelURL);
  model.summary()
  return model
}


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


module.exports = {
    padSequences,
    loadModel,
    preprocessDFInputs,
    tokenizerFromJson
  }