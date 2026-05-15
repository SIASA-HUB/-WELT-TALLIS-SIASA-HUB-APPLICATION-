/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function(knex) {
  return knex.schema.createTable('payments', (table) => {
    table.increments('id').primary();
    table.string('transaction_id').unique().notNullable();
    table.string('phone_number').notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.string('payment_type').notNullable(); // wallet, marketplace, boost
    table.integer('aspirant_id').nullable();
    table.string('order_id').nullable();
    table.string('status').defaultTo('pending'); // pending, completed, failed
    table.string('receipt_number').nullable();
    table.text('message').nullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function(knex) {
  return knex.schema.dropTable('payments');
};
