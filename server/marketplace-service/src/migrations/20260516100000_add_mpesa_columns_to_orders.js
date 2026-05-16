// 20260516100000_add_mpesa_columns_to_orders.js
exports.up = async function(knex) {
  const hasCheckoutId = await knex.schema.hasColumn('orders', 'mpesa_checkout_id');
  const hasReceipt = await knex.schema.hasColumn('orders', 'mpesa_receipt');
  
  await knex.schema.alterTable('orders', (table) => {
    if (!hasCheckoutId) {
      table.string('mpesa_checkout_id', 100).nullable().after('status');
    }
    if (!hasReceipt) {
      table.string('mpesa_receipt', 50).nullable().after('mpesa_checkout_id');
    }
  });
  
  // Also ensure 'pending_payment', 'paid', 'failed' are valid statuses
  // by changing status from enum to varchar (more flexible)
  try {
    await knex.raw(`ALTER TABLE orders MODIFY COLUMN status VARCHAR(30) DEFAULT 'pending_payment'`);
    console.log("✅ Orders table: added M-Pesa columns and expanded status field");
  } catch (e) {
    console.warn("⚠️ Could not modify status column (may already be VARCHAR):", e.message);
  }
};

exports.down = async function(knex) {
  await knex.schema.alterTable('orders', (table) => {
    table.dropColumn('mpesa_checkout_id');
    table.dropColumn('mpesa_receipt');
  });
};
