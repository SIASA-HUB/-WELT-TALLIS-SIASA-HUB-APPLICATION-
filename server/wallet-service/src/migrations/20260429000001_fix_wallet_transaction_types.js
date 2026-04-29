// migrations/20260429000001_fix_wallet_transaction_types.js
// FIX: The wallet_transactions `type` column ENUM was too narrow.
// LeaderController inserts 'verification' and 'manifesto_boost' but the
// original schema only allowed ['deposit', 'endorsement', 'bonus', 'refund'].
// This caused silent DB failures that aborted story/endorsement creation flows.

exports.up = async function (knex) {
  try {
    console.log('📦 Fixing wallet_transactions type ENUM to include all used values...');

    const transactionsExists = await knex.schema.hasTable('wallet_transactions');
    if (!transactionsExists) {
      console.log('⏭️  wallet_transactions table does not exist, skipping');
      return;
    }

    // Alter the ENUM to include all types actually used in the codebase
    await knex.raw(`
      ALTER TABLE wallet_transactions 
      MODIFY COLUMN type ENUM(
        'deposit',
        'endorsement',
        'bonus',
        'refund',
        'verification',
        'manifesto_boost',
        'boost',
        'withdrawal'
      ) NOT NULL
    `);

    console.log('✅ wallet_transactions type ENUM expanded successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
};

exports.down = async function (knex) {
  try {
    await knex.raw(`
      ALTER TABLE wallet_transactions 
      MODIFY COLUMN type ENUM('deposit', 'endorsement', 'bonus', 'refund') NOT NULL
    `);
    console.log('✅ Rollback: wallet_transactions type ENUM restored');
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    throw error;
  }
};
