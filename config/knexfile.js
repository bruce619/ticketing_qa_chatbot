// Update with your config settings.
require('dotenv').config({path: '../.env'})
const config = require('./config');

module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      host: config.db.host,
      port : config.db.port,
      user : config.db.user,
      password : config.db.password,
      database : config.db.database
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: '../db/migrations'
    },
    seeds: {
      directory: '../db/seeds'
    }
  },
 
  production: {
    client: 'postgresql',
    connection: {
      host: config.db.host,
      port : config.db.port,
      user : config.db.user,
      password : config.db.password,
      database : config.db.database
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
