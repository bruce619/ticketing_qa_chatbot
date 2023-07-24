const crypto = require('crypto');


// generate random secure sessionID using crypto
generateRandomSessionId = () => {
    return crypto.randomBytes(16).toString('hex');
  }


module.exports = {
    generateRandomSessionId
}