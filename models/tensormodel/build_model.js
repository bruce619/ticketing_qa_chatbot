const tf = require('@tensorflow/tfjs-node');
const { input_shape, output_length, vocab_size, x_train, y_train, saveModelInfoToFile} = require("./preprocess_data");

async function fitModel(){
    
    await saveModelInfoToFile();

    const i = tf.input({shape: [input_shape]});
    let x = tf.layers.embedding({inputDim: vocab_size + 1, outputDim: 128}).apply(i)
    x = tf.layers.lstm({units: 60, returnSequences: true}).apply(x)
    x = tf.layers.flatten().apply(x)
    x = tf.layers.dense({units: 21, activation: 'relu'}).apply(x)
    x = tf.layers.dense({units: output_length, activation: 'softmax'}).apply(x);
    const model = tf.model({inputs: i, outputs: x})
    // Set the learning rate for the optimizer
    const learningRate = 0.001; // You can change this value as needed
    // Define the optimizer with the learning rate
    // const optimizer = tf.train.adam(learningRate);
    // model.compile({loss: 'sparseCategoricalCrossentropy', optimizer: optimizer, metrics: ['accuracy'] })
    model.compile({loss: 'sparseCategoricalCrossentropy', optimizer: 'adam', metrics: ['accuracy'] })

    
    const epochs = 5;
    const batchSize = 32;

    const options = {
        epochs: epochs,
        batchSize: batchSize,
        callbacks: {
            onEpochBegin: async (epoch, logs)=>{
                console.log(`Epoch ${epoch + 1} of ${epochs} ...`)
            },
            onEpochEnd: async (epoch, logs)=>{
                console.log(` training-set loss: ${logs.loss.toFixed(4)}`)
                console.log(` training-set accuracy: ${logs.acc.toFixed(4)}`)
            }
        }
    }

    await model.fit(x_train, y_train, options)

    return model
}


// (async () => {

//     await fitModel();

// })()

module.exports = {
    fitModel
}


