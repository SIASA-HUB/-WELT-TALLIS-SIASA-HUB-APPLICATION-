
exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('app_clicks');
  if (!exists) {
    await knex.schema.createTable('app_clicks', (table) => {
      table.increments('id').primary();
      table.string('element_id', 100);
      table.string('element_class', 255);
      table.string('element_tag', 50);
      table.string('page_url', 255);
      table.string('text_content', 255);
      table.string('user_id', 50);
      table.string('ip_address', 45);
      table.timestamp('clicked_at').defaultTo(knex.fn.now());
      
      table.index('element_id');
      table.index('page_url');
      table.index('clicked_at');
    });
    console.log("Created app_clicks table");
  } else {
    console.log("ℹapp_clicks table already exists, skipping");
  }
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('app_clicks');
  console.log("Dropped app_clicks table");
};
