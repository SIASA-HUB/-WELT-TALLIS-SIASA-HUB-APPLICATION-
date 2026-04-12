// 20260413_add_email_to_users.js
exports.up = async function(knex) {
  // Check if email column exists
  const hasEmail = await knex.schema.hasColumn('users', 'email');
  
  if (!hasEmail) {
    await knex.schema.table('users', (table) => {
      table.string('email', 255).unique().nullable();
    });
    console.log("Added email column to users table");
    
   
    try {
      await knex.raw('CREATE INDEX idx_users_email ON users(email)');
      console.log(" Added email index");
    } catch (err) {
      // Index might already exist
      if (!err.message.includes('Duplicate key name')) {
        console.log("Index may already exist:", err.message);
      }
    }
  } else {
    console.log("Email column already exists");
  }
};

exports.down = async function(knex) {
  const hasEmail = await knex.schema.hasColumn('users', 'email');
  if (hasEmail) {
    // Drop index first (ignore if doesn't exist)
    try {
      await knex.raw('DROP INDEX idx_users_email ON users');
    } catch (err) {
      // Index might not exist
      console.log("Index may not exist:", err.message);
    }
    
    await knex.schema.table('users', (table) => {
      table.dropColumn('email');
    });
    console.log("Dropped email column");
  }
};