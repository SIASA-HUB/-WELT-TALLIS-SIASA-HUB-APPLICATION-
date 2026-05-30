export const up = (knex) =>
  knex.schema.createTable('payment_ledger', (t) => {
    t.increments('id').primary();

    // Links all events for one payment together
    t.string('checkout_request_id').notNullable().index();

    // Event type: initiated | pending | completed | failed | cancelled | refunded
    t.string('event').notNullable();

    // Core payment info (repeated per row for full auditability)
    t.string('phone_number').notNullable();
    t.decimal('amount', 15, 2).notNullable();
    t.string('payment_type').notNullable();   // wallet | marketplace | billing | boost
    t.string('account_reference').nullable();
    t.string('user_id').nullable();
    t.string('order_id').nullable();
    t.string('aspirant_id').nullable();

    // Safaricom response fields
    t.string('merchant_request_id').nullable();
    t.string('mpesa_receipt_number').nullable();  // populated on completed
    t.integer('result_code').nullable();
    t.text('result_desc').nullable();

    // Each row is immutable — no updates ever
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

export const down = (knex) => knex.schema.dropTable('payment_ledger');