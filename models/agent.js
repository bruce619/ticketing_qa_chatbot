const { Model } = require('objection');

class Agent extends Model {
  static get tableName() {
    return 'agents';
  }
  
  static get idColumn() {
    return 'user_id';
  }


static get relationMappings() {
    const User = require('./user')

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'agents.user_id',
          to: 'users.id',
        },
      },
    };
  }
}

module.exports = Agent;