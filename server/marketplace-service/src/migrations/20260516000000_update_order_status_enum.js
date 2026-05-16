
exports.up = function(knex) {
  return knex.schema.alterTable('orders', table => {
    table.enum('status', ['pending', 'pending_payment', 'processed', 'shipped', 'completed', 'cancelled'], {
      useNative: true,
      enumName: 'order_status'
    }).alter();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('orders', table => {
    table.enum('status', ['pending', 'processed', 'shipped', 'completed', 'cancelled'], {
      useNative: true,
      enumName: 'order_status'
    }).alter();
  });
};
