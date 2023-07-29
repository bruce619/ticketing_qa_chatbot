const { Model } = require('objection');

class Client extends Model {
  static get tableName() {
    return 'clients';
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
          from: 'clients.user_id',
          to: 'users.id',
        },
      },
    };
  }
}

module.exports = Client;