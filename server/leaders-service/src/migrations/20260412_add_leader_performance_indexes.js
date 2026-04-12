exports.up = async function (knex) {
  const hasLeaders = await knex.schema.hasTable("leaders");
  if (hasLeaders) {
    await knex.schema.table("leaders", async (table) => {
      // 1. Composite index for Popular/Trending Aspirants
      // ORDER BY (boost_score * 10 + views * 2 + followers * 3) DESC, created_at DESC
      // Since MySQL doesn't index expressions easily without generated columns, 
      // we'll index the most important contributing columns together.
      table.index(["status", "boost_score", "views", "followers", "created_at"], "idx_leaders_popularity_perf");
      
      // 2. Index for slug lookups (SEO)
      const hasSlugIndex = await knex.schema.hasColumn("leaders", "slug");
      if (hasSlugIndex) {
        table.index(["slug", "status"], "idx_leaders_slug_status");
      }
    });
  }
};

exports.down = async function (knex) {
  const hasLeaders = await knex.schema.hasTable("leaders");
  if (hasLeaders) {
    await knex.schema.table("leaders", (table) => {
      table.dropIndex(["status", "boost_score", "views", "followers", "created_at"], "idx_leaders_popularity_perf");
      table.dropIndex(["slug", "status"], "idx_leaders_slug_status");
    });
  }
};
