const tf = require('@tensorflow/tfjs-node');
const { input_shape, output_length, vocab_size, x_train, y_train} = require("./preprocess_data");

async function fitModel(){
    console.log(input_shape)
    console.log(output_length)
    console.log(vocab_size)
    console.log(x_train)
    console.log(y_train)

    const i = tf.input({shape: [input_shape]});
    let x = tf.layers.embedding({inputDim: vocab_size + 1, outputDim: 64}).apply(i)
    x = tf.layers.lstm({units: 64, returnSequences: true}).apply(x)
    x = tf.layers.flatten().apply(x)
    x = tf.layers.dense({units: output_length, activation: 'softmax'}).apply(x);
    const model = tf.model({inputs: i, outputs: x})
    model.compile({loss: 'sparseCategoricalCrossentropy', optimizer: 'adam', metrics: ['accuracy'] })

    
    const epochs = 10;
    const batchSize = 32;

    const options = {
        epochs: epochs,
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

module.exports = {
    fitModel
}


