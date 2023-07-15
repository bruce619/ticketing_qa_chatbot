/**
 //* @param { import("knex").Knex } knex
 //* @returns { Promise<void> }
 //*/
exports.up = function(knex) {

    return knex.schema
    .createTable('user', function(table){
        table.uuid('id').defaultTo(knex.raw('gen_random_uuid ()')).primary();
        table.string('first_name', 200).notNullable().index();
        table.string('last_name', 200).notNullable().index();
        table.string('email').unique().notNullable().index()
        table.boolean('two_fa_enabled').defaultTo(false);
        table.string('otp', 10)
        table.timestamp('expiration_time')
        table.string('password').notNullable();
        table.string('reset_password_token')
        table.timestamp('reset_password_expiry_time')
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('staff', function(table) {
        table.uuid('id').defaultTo(knex.raw('gen_random_uuid ()')).primary();
        table.string('staff_id', 200).notNullable().index();
        table.boolean('admin').defaultTo(false);
        // references the 'users' primary key in new table 'posts'
        table.uuid('user')
        .notNullable()
        .references('id')
        .inTable('user')
        .onDelete('CASCADE')

    })
    .createTable('client', function(table) {
        table.uuid('id').defaultTo(knex.raw('gen_random_uuid ()')).primary();
        // references the 'users' primary key in new table 'posts'
        table.string('location', 150); // needed so others can know where the client is
        table.uuid('user')
        .notNullable()
        .references('id')
        .inTable('user')
        .onDelete('CASCADE')
    })
};

/**
 //* @param { import("knex").Knex } knex
// * @returns { Promise<void> }
 //*/
 exports.down = function(knex) {
    return knex.schema
    .dropTableIfExists('client')
    .dropTableIfExists('staff')
    .dropTableIfExists('user')
  };
