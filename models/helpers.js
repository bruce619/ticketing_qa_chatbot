const path = require('path')

const modelPath = path.join(__dirname, '../chatbotmodel') // path to the model directory 

function padSequences(sequences, maxlen = null, padding = 'pre', truncating = 'pre', value = 0) {
  const paddedSequences = [];

  // Determine the maximum length if not provided
  if (maxlen === null) {
    maxlen = sequences.reduce((maxLen, seq) => Math.max(maxLen, seq.length), 0);
  }

  for (const sequence of sequences) {
    if (truncating === 'pre' && sequence.length > maxlen) {
      paddedSequences.push(sequence.slice(sequence.length - maxlen));
    } else if (truncating === 'post' && sequence.length > maxlen) {
      paddedSequences.push(sequence.slice(0, maxlen));
    } else {
      const paddingLength = maxlen - sequence.length;
      const paddingArray = new Array(paddingLength).fill(value);

      if (padding === 'pre') {
        paddedSequences.push([...paddingArray, ...sequence]);
      } else {
        paddedSequences.push([...sequence, ...paddingArray]);
      }
    }
  }

  return paddedSequences;
}


const regexPunctuation = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
function preprocessDFInputs(dataFrame){
  // remove punctuation and lower the case
  return dataFrame.withColumn('inputs', (row) => row.get('inputs').toLowerCase().replace(regexPunctuation, ''))
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