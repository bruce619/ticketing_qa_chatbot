const { Model } = require('objection');

class Client extends Model {
  static get tableName() {
    return 'clients';
  }
}

module.exports = Client;