const tf = require('@tensorflow/tfjs-node');
const { tokenizer, responses, input_shape, encode } = require('./preprocess_data');
const { removePunctuations } = require('../../utility/utils');
const { padSequences } = require('./helpers');


async function loadModel(){
    const modelURL = 'file://../../jschatbotmodel/model.json'
    console.log("loading model ...")
    const model = await tf.loadLayersModel(modelURL);
    model.summary()
    return model
}


async function chatBot(textInput, tokenizer, input_shape, model, responses){
    const textP = [removePunctuations(textInput)];
    let predictedInput = tokenizer.textsToSequences(textP)
    predictedInput = padSequences(predictedInput, input_shape)
    let output = await model.predict(predictedInput);
    output = output.argMax(-1)
    output.print()
    const tag = encode.inverseTransform(output).arraySync()[0];
    // Get the array of responses for the specified category
    const responseArray = responses[tag];
    // Generate a random index within the range of the array
    const randomIndex = Math.floor(Math.random() * responseArray.length);
    // Get the random response using the random index
    const botResponse = responseArray[randomIndex];

    console.log(`tag: ${tag}, response: ${botResponse}`)

}


(async () => {

    const textInput = "do you have wood poolish?"

    const model = await loadModel()

    await chatBot(textInput, tokenizer, input_shape, model, responses)

})()





