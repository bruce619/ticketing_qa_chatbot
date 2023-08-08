const { Model } = require('objection');

class Conversation extends Model {
  static get tableName() {
    return 'conversations';
  }

  static get relationMappings() {
    const Ticket = require('./ticket');
    const User = require('./user');

    return {
      ticket: {
        relation: Model.BelongsToOneRelation,
        modelClass: Ticket,
        join: {
          from: 'conversations.ticket_id',
          to: 'tickets.id',
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'conversations.user_id',
          to: 'users.id',
        },
      },
    };
  }
}

module.exports = Conversation;