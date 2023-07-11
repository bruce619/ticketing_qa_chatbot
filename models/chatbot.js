const tf = require('@tensorflow/tfjs-node')
const dfd = require('danfojs-node')
const path = require('path');

let le = new dfd.LabelEncoder()

const modelPath = path.join(__dirname, '../chatbotmodel');


async function loadModel(modelPath) {
    const modelMetadata = await tf.node.getMetaGraphsFromSavedModel(modelPath);
    const tags = modelMetadata[0].tags;
    const signatureDefs = modelMetadata[0].signatureDefs;
    const signatureKeys = Object.keys(signatureDefs);
  
    const model = await tf.node.loadSavedModel(modelPath, tags, signatureKeys);
    return model
  }


function printModelSummary(model) {
  console.log('Model Summary:');
  model.summary();
}
  


loadModel(modelPath)
.then((model)=>{
  // console.log(printModelSummary(model))
  console.log(model)
})
.catch((error) => {
  console.error('Failed to load the model:', error);
});