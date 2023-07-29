const crypto = require('crypto');
const bcrypt = require ('bcrypt'); 
// require bcrypt
//https://heynode.com/blog/2020-04/salt-and-hash-passwords-bcrypt/
// function to salt and hash password using bcrypt library
function hashPassword(password){
    const salt_rounds = 10;
    const salt = bcrypt.genSaltSync(salt_rounds);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}
// function to compare hash password and normal password
function comparePasswords(password, passWord){
  // password: user input password
  // passWord: hashed password
  return bcrypt.compare(password, passWord);
}


// generate random secure sessionID using crypto
function generateRandomSessionId(){
    return crypto.randomBytes(16).toString('hex');
  }



  async function checkUserType(userId) {
    const user = await User.query()
      .findById(userId)
      .withGraphFetched('[client, agent]')
      .modifyGraph('client', (builder) => {
        builder.select('id');
      })
      .modifyGraph('agent', (builder) => {
        builder.select('id', 'is_admin');
      });
  
    if (user.client && !user.agent) {
      return 'client';
    } else if (user.agent && !user.client) {
      return user.agent.is_admin ? 'admin' : 'agent';
    } else {
      // User is neither a client nor an agent
      return 'unknown';
    }
  }

module.exports = {
    generateRandomSessionId,
    hashPassword,
    comparePasswords,
    checkUserType
}