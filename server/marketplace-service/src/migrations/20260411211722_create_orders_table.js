// 20260411211722_create_orders_table.js
exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('orders');
  if (!exists) {
    await knex.schema.createTable('orders', (table) => {
      table.increments('id').primary();
      table.string('order_number', 50).notNullable().unique();
      table.string('user_id', 50).nullable();
      table.string('customer_name', 255).notNullable();
      table.string('customer_email', 255).notNullable();
      table.string('customer_phone', 50);
      table.text('address').notNullable();
      table.decimal('total_amount', 10, 2).notNullable();
      table.enum('status', ['pending', 'processed', 'shipped', 'completed', 'cancelled']).defaultTo('pending');
      table.json('items').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.index('order_number');
      table.index('status');
      table.index('customer_email');
    });
    console.log("✅ Orders table created");
  }
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('orders');
};