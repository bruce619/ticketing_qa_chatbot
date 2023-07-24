const { Model } = require('objection');

class Agent extends Model {
  static get tableName() {
    return 'agents';
  }
}

module.exports = Agent;