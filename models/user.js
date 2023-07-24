const { Model } = require('objection');


// main User model.
class User extends Model {

    static get tableName() {
        return 'users';
    }

    // method to get full name
    fullName() {
        return this.firstName + ' ' + this.lastName;
    }

    static get relationMappings() {
        const Agent = require('./agent');
        const Client = require('./client');
    
        return {
          agent: {
            relation: Model.HasOneRelation,
            modelClass: Agent,
            join: {
              from: 'users.id',
              to: 'agents.user_id',
            },
          },
          client: {
            relation: Model.HasOneRelation,
            modelClass: Client,
            join: {
              from: 'users.id',
              to: 'clients.user_id',
            },
          },
        };
      }
}


module.exports = User;
