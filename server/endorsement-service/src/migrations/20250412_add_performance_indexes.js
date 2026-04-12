exports.up = async function (knex) {
  const hasEndorsements = await knex.schema.hasTable("endorsements");
  if (hasEndorsements) {
    await knex.schema.table("endorsements", (table) => {
      // 1. Composite index for Recent Endorsements and Stories
      // WHERE status = 'active' ORDER BY created_at DESC
      table.index(["status", "created_at"], "idx_endorsements_status_created");
      
      // 2. Composite index for Leader-specific recent endorsements
      // WHERE leader_id = ? AND status = 'active' ORDER BY created_at DESC
      table.index(["leader_id", "status", "created_at"], "idx_leader_status_created");
      
      // 3. Composite index for Trending Score calculations
      // WHERE leader_id = ? AND status = 'active' AND created_at >= ?
      table.index(["leader_id", "status", "created_at", "likes", "views", "shares", "comments"], "idx_endorsements_trending_perf");
    });
  }
};

exports.down = async function (knex) {
  const hasEndorsements = await knex.schema.hasTable("endorsements");
  if (hasEndorsements) {
    await knex.schema.table("endorsements", (table) => {
      table.dropIndex(["status", "created_at"], "idx_endorsements_status_created");
      table.dropIndex(["leader_id", "status", "created_at"], "idx_leader_status_created");
      table.dropIndex(["leader_id", "status", "created_at", "likes", "views", "shares", "comments"], "idx_endorsements_trending_perf");
    });
  }
};
