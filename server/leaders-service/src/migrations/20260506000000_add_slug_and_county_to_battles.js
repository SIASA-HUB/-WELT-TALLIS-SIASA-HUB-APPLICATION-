
exports.up = async function (knex) {
  // Add slug and question to battles table
  const hasSlug = await knex.schema.hasColumn("battles", "slug");
  if (!hasSlug) {
    await knex.schema.table("battles", (table) => {
      table.string("slug", 255).unique().nullable();
    });
    console.log("✅ Added 'slug' column to battles table");
  }

  const hasQuestion = await knex.schema.hasColumn("battles", "question");
  if (!hasQuestion) {
    await knex.schema.table("battles", (table) => {
      table.text("question").nullable();
    });
    console.log("✅ Added 'question' column to battles table");
  }

  // Add county to battle_votes table
  const hasCounty = await knex.schema.hasColumn("battle_votes", "county");
  if (!hasCounty) {
    await knex.schema.table("battle_votes", (table) => {
      table.string("county", 100).nullable();
    });
    console.log("✅ Added 'county' column to battle_votes table");
  }
};

exports.down = async function (knex) {
  await knex.schema.table("battles", (table) => {
    table.dropColumn("slug");
    table.dropColumn("question");
  });
  await knex.schema.table("battle_votes", (table) => {
    table.dropColumn("county");
  });
};
