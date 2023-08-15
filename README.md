# ticketing_qa_chatbot
A intelligent chatbot along with an analytics dashboard for SMEs looking to improve customer service - client interaction and keeping track of analytics.

The intelligent chatbot is developed using a tensorflow model with keras layer api, built on a bidirectional LSTM (Long Short Term Memory) architecture and trained on a dataset for chatbot/virtual assistants.

The LSTM are a type of recurrent neural network (RNN) architecture that processes input data in both forward and backward directions.


## Features
- Chatbot Question and Answer (FAQ)
- Dashboard Account Registration, Login, and Sign Out
- Admin and Agent can ee dashboard statistic summary
- Profile Update
- 2FA (optional)
- Admin can create Agents and Clients on dashboard
- Client can create tickets
- Admins and Agents can update client like location and phone number on behalf of the client
- Agents and Admins can create tickets on behalf of client
- Admins can update tickets (Can reassign a ticket to another agent, can change ticket priority and status)
- Agent can update tickets (Can change ticket priority and status)
- Client can chat with live Agents
- Client can rate agents
- Search functionality 
- Admin and Agent can see reports


## Architecture  & Design Pattern
[MVC (Model-View-Controller)](https://www.geeksforgeeks.org/model-view-controllermvc-architecture-for-node-applications/)


## Requirements
Use the latest version of Node/NPM

## Tech
- [Node JS](https://www.nodejs.org)
- [Express JS](https://www.expressjs.com)
- [EJS](https://ejs.co/)
- [Postgres](https://www.postgresql.org/)
- [Knex JS](https://knexjs.org/)
- [Objection JS](https://vincit.github.io/objection.js/)
- [TensorFlow](https://www.tensorflow.org/js/guide)
- [Pandas](https://pandas.pydata.org/docs/)
- [Danfo JS](https://danfo.jsdata.org/getting-started)



## Installation
Use the package manager [npm](https://docs.npmjs.com/cli/v9/commands/npm-install) to install all dependencies in package.json

``` bash
npm install
```

Create a .env file in the project root directory. 
In the .env file create environment variables for development and production environments like:

> development environment
- SECRET_KEY=your-aplhanumeric-secret-key

> app
- NODE_ENV=development
- DEV_APP_PORT=3000

> dev database
- DEV_DB_HOST=localhost
- DEV_DB_PORT=5432
- DEV_DB_USER=your local db user name
- DEV_DB_DATABASE=blog
- DEV_DB_PASSWORD=your local pg db password

> email server credentials
- EMAIL_USERNAME=
- EMAIL_PASSWORD=


> prod database
- PROD_DB_USER=
- PROD_DB_DATABASE=
- PROD_DB_PASSWORD=
- PROD_DB_HOST=cmpstudb-01.cmp.uea.ac.uk
- PROD_DB_PORT=5432


Migrate the database schema to your pg database (chatbotdb)
```bash
npm run migrate
```

To run the Node app use
```bash
npm start
```

To run test
```bash
npm test
```