const { fitModel } = require("./build_model")

async function saveModel(model, modelPath) {
    await model.save(modelPath);
    console.log('Model saved successfully!');
  }
  
  // Usage
  (async () => {
    const trainedModel = await fitModel();
    const modelPath = 'file://../../jschatbotmodel'
    await saveModel(trainedModel, modelPath);
  })();

