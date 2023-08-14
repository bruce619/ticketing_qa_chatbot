require('dotenv').config();

const env = process.env.NODE_ENV || 'development'; // 'development' or 'production'

const development = { 

    app: {
        port: parseInt(process.env.DEV_APP_PORT),
        environment: process.env.NODE_ENV,
        secret_key: process.env.SECRET_KEY
    },

    db: {
        host: process.env.DEV_DB_HOST,
        port : parseInt(process.env.DEV_DB_PORT),
        user : process.env.DEV_DB_USER,
        password : process.env.DEV_DB_PASSWORD,
        database : process.env.DEV_DB_DATABASE
    }

};


const production = { 

    app: {
        port: parseInt(process.env.PROD_APP_PORT) || 3000,
        environment: process.env.NODE_ENV,
        secret_key: process.env.SECRET_KEY
    },

    db: {

        host: process.env.PROD_DB_HOST,
        port : parseInt(process.env.PROD_DB_PORT) || 5432,
        user : process.env.PROD_DB_USER,
        password : process.env.PROD_DB_PASSWORD,
        database : process.env.PROD_DB_DATABASE || 'chatbotdb'

    }

};

const config = {
    development,
    production 
    }

module.exports = config[env];