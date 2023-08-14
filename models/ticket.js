const { Model } = require('objection');

class Ticket extends Model {
  static get tableName() {
    return 'tickets';
  }

  static get relationMappings() {
    const Agent = require('./agent');
    const Client = require('./client');
    const Conversation = require('./conversation');

    return {
      agent: {
        relation: Model.BelongsToOneRelation,
        modelClass: Agent,
        join: {
          from: 'tickets.agent_id',
          to: 'agents.user_id',
        },
      },
      client: {
        relation: Model.BelongsToOneRelation,
        modelClass: Client,
        join: {
          from: 'tickets.client_id',
          to: 'clients.user_id',
        },
      },
      conversations: {
        relation: Model.HasManyRelation,
        modelClass: Conversation,
        join: {
          from: 'tickets.id',
          to: 'conversations.ticket_id',
        },
      },
    };
  }
}

module.exports = Ticket;