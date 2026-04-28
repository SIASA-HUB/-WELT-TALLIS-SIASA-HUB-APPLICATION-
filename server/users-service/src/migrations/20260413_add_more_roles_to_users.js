// 20260413_add_more_roles_to_users.js
exports.up = async function(knex) {

  const hasRoleColumn = await knex.schema.hasColumn('users', 'role');
  
  if (hasRoleColumn) {
  
    try {
      await knex.raw(`
        ALTER TABLE users 
        MODIFY COLUMN role ENUM('user', 'admin', 'administrator', 'market_admin') 
        DEFAULT 'user'
      `);
      console.log("Updated role column with market_admin and administrator roles");
    } catch (err) {
      console.log("Note: Could not modify role column (might already be updated or have incompatible data):", err.message);
    }
  } else {
    // Add role column if it doesn't exist
    await knex.schema.table('users', (table) => {
      table.enum('role', ['user', 'admin', 'administrator', 'market_admin']).defaultTo('user');
    });
    console.log(" Added role column with market_admin and administrator roles");
  }
  
  // Update existing admin users to have administrator role
  await knex('users')
    .where('role', 'admin')
    .update({ role: 'administrator' });
  console.log(" Updated existing admin users to administrator role");
  
  // Add index for role column using raw SQL (skip if exists)
  try {
    await knex.raw('CREATE INDEX idx_users_role ON users(role)');
    console.log(" Added role index");
  } catch (err) {
    // Index might already exist
    if (!err.message.includes('Duplicate key name')) {
      console.log("Note:", err.message);
    }
  }
};

exports.down = async function(knex) {
  // Revert to original role options
  await knex.raw(`
    ALTER TABLE users 
    MODIFY COLUMN role ENUM('user', 'admin') 
    DEFAULT 'user'
  `);
  console.log(" Reverted role column to original options");
  
  // Drop index (ignore if doesn't exist)
  try {
    await knex.raw('DROP INDEX idx_users_role ON users');
  } catch (err) {
    console.log("Index may not exist:", err.message);
  }
  
  console.log(" Rollback completed");
};