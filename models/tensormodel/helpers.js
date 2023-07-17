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


// load model
async function loadModel (tf) {
  const modelMetadata = await tf.node.getMetaGraphsFromSavedModel(modelPath);
  const tags = modelMetadata[0].tags;
  const signatureDefs = modelMetadata[0].signatureDefs;
  const signatureKeys = Object.keys(signatureDefs);
  let model = await tf.node.loadSavedModel(modelPath, tags, signatureKeys);
  return model
}


module.exports = {
    padSequences,
    loadModel,
    preprocessDFInputs
}