/**
 //* @param { import("knex").Knex } knex
 //* @returns { Promise<void> }
 //*/
exports.up = function(knex) {

    return knex.schema
    .createTable('users', function(table){
        table.uuid('id').defaultTo(knex.raw('gen_random_uuid ()')).primary();
        table.string('first_name', 200).index();
        table.string('last_name', 200).index();
        table.string('email').unique().notNullable().index()
        table.boolean('two_fa_enabled').defaultTo(false);
        table.string('otp', 10)
        table.string('is_used').defaultTo(false)
        table.timestamp('expiration_time')
        table.string('password').notNullable();
        table.string('reset_password_token')
        table.timestamp('reset_password_expiry_time')
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('agents', function(table) {
        table.uuid('user_id').unique().primary().references('id').inTable('users').onDelete('CASCADE');
        table.string('staff_id', 200).index();
        table.boolean('is_admin').defaultTo(false);
        table.string('department').checkIn(['IT', 'SALES', 'ACCOUNT', 'BUSINESS']).nullable();
        table.timestamp('updated_at').defaultTo(knex.fn.now());
      })
      .createTable('clients', function(table) {
        table.uuid('user_id').unique().primary().references('id').inTable('users').onDelete('CASCADE');
        table.string('location', 100);
        table.string('phone', 15);
        table.timestamp('updated_at').defaultTo(knex.fn.now());
      })
      .createTable('tickets', function (table) {
        table.uuid('id').defaultTo(knex.raw('gen_random_uuid ()')).primary();
        table.string('ticket_id', 200).index();
        table.uuid('agent_id').references('user_id').inTable('agents');
        table.uuid('client_id').notNullable().references('user_id').inTable('clients');
        table.string('subject');
        table.text('description');
        table.string('tag');
        table.string('status').checkIn(['OPEN', 'CLOSED', 'IN_PROGRESS']).defaultTo('OPEN');
        table.string('priority').checkIn(['LOW', 'MEDIUM', 'HIGH']).nullable();
        table
        .integer('ratings')
        .unsigned()
        .notNullable()
        .defaultTo(0)
        .checkIn([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
      })
    .createTable('conversations', function (table){
        table.increments('id').primary();
        table.uuid('ticket_id').notNullable().references('id').inTable('tickets');
        table.uuid('user_id').notNullable().references('id').inTable('users');
        table.text('message').notNullable();
        table.string('image').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
};

/**
 //* @param { import("knex").Knex } knex
// * @returns { Promise<void> }
 //*/
 exports.down = function(knex) {
    return knex.schema
    .dropTableIfExists('conversations')
    .dropTableIfExists('tickets')
    .dropTableIfExists('clients')
    .dropTableIfExists('agents')
    .dropTableIfExists('users')
  };
