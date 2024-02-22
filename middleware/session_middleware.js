const config = require('../config/config');
const { generateRandomSessionId } = require('../utility/helpers');
const session = require('express-session');
const Redis = require('ioredis');
const RedisStore = require('connect-redis')(session);

const SECRET = config.app.secret_key


const REDIS_URL = process.env.REDIS_URL

// redis store middleware for production test
const redisClient = new Redis(REDIS_URL);

// redis store middleware for local
// const redisClient = new Redis();

const store = new RedisStore({client: redisClient});

//Configure session middleware
module.exports = session({
    store: store,
    secret: SECRET,
    resave: false, // required: force lightweight session keep alive (touch)
    saveUninitialized: false, // recommended: only save session when data exists

    name: "cs", // name of the session ID cookie to set in the response. Don't use the default 'sid'

    // Function to generate a new session ID. 
    // Provide a function that returns a string that will be used as a session ID.
    genid: function(req) {
      return generateRandomSessionId();
    },

    cookie: {

      // secure: Only set to true in production with SSL enabled
      // i.e., HTTPS is necessary for secure cookies. If secure is set, and you access your site over HTTP, 
      // the cookie will not be set.
      secure: false, // true on live
      // httpOny: if true prevent client side JS from reading the cookie 
      // Only set to true if your are using HTTPS.
      httpOnly: false, // true on live.

      // session time out: session max age in miliseconds (10 min)
      // Calculates the Expires Set-Cookie attribute
      maxAge: 1000 * 60 * 15,

    }
  })

