// 20250413_add_slug_to_products.js
exports.up = async function (knex) {
  // Check if slug column exists
  const hasSlug = await knex.schema.hasColumn('products', 'slug');

  if (!hasSlug) {
    await knex.schema.table('products', (table) => {
      table.string('slug', 255).unique();
    });


    // Generate slugs for existing products
    const products = await knex('products').select('id', 'name');
    for (const product of products) {
      let slug = product.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      // Check if slug exists
      let existing = await knex('products').where('slug', slug).first();
      if (existing) {
        slug = `${slug}-${product.id}`;
      }

      await knex('products').where('id', product.id).update({ slug: slug });
    }
    console.log("Generated slugs for existing products");
  } else {
    console.log("ℹSlug column already exists");
  }
};

exports.down = async function (knex) {
  const hasSlug = await knex.schema.hasColumn('products', 'slug');
  if (hasSlug) {
    await knex.schema.table('products', (table) => {
      table.dropColumn('slug');
    });
    console.log("✅ Dropped slug column");
  }
};