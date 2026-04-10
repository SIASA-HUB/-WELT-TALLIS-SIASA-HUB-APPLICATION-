// migrations/20250330_add_endorsement_engagement_features.js

exports.up = async function (knex) {
  const leadersTableExists = await knex.schema.hasTable("leaders");
  // 1. Add engagement and pinning columns to endorsements table
  const hasIsPinned = await knex.schema.hasColumn("endorsements", "is_pinned");
  if (!hasIsPinned) {
    await knex.schema.table("endorsements", (table) => {
      table.boolean("is_pinned").defaultTo(false);
      table.timestamp("pinned_at").nullable();
      table.integer("likes").defaultTo(0);
      table.integer("views").defaultTo(0);
      table.integer("shares").defaultTo(0);
      table.integer("comments").defaultTo(0);
      table.integer("engagement_score").defaultTo(0);

      // Add indexes for better performance
      table.index("is_pinned");
      table.index("pinned_at");
      table.index("engagement_score");
      table.index(["leader_id", "is_pinned"]);
      table.index(["leader_id", "engagement_score"]);
    });
  }

  // 2. Create endorsement_likes table
  const likesExists = await knex.schema.hasTable("endorsement_likes");
  if (!likesExists) {
    await knex.schema.createTable("endorsement_likes", (table) => {
      table.increments("id").primary();
      table.integer("endorsement_id").unsigned().notNullable();
      table.string("user_id", 50).notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.unique(["endorsement_id", "user_id"]);
      table.index("endorsement_id");
      table.index("user_id");
      table.index("created_at");

      table
        .foreign("endorsement_id")
        .references("id")
        .inTable("endorsements")
        .onDelete("CASCADE");
    });
  }

  // 3. Create endorsement_views table for tracking views
  const viewsExists = await knex.schema.hasTable("endorsement_views");
  if (!viewsExists) {
    await knex.schema.createTable("endorsement_views", (table) => {
      table.increments("id").primary();
      table.integer("endorsement_id").unsigned().notNullable();
      table.string("user_id", 50).nullable();
      table.string("ip_address", 45).nullable();
      table.string("device_id", 100).nullable();
      table.timestamp("viewed_at").defaultTo(knex.fn.now());

      table.index("endorsement_id");
      table.index("viewed_at");
      table.index(["endorsement_id", "user_id"]);

      table
        .foreign("endorsement_id")
        .references("id")
        .inTable("endorsements")
        .onDelete("CASCADE");
    });
  }

  // 4. Create endorsement_shares table
  const sharesExists = await knex.schema.hasTable("endorsement_shares");
  if (!sharesExists) {
    await knex.schema.createTable("endorsement_shares", (table) => {
      table.increments("id").primary();
      table.integer("endorsement_id").unsigned().notNullable();
      table.string("user_id", 50).nullable();
      table.string("platform", 50).nullable();
      table.string("share_url", 500).nullable();
      table.timestamp("shared_at").defaultTo(knex.fn.now());

      table.index("endorsement_id");
      table.index("shared_at");
      table.index(["endorsement_id", "platform"]);

      table
        .foreign("endorsement_id")
        .references("id")
        .inTable("endorsements")
        .onDelete("CASCADE");
    });
  }

  // 5. Create endorsement_comments table
  const commentsExists = await knex.schema.hasTable("endorsement_comments");
  if (!commentsExists) {
    await knex.schema.createTable("endorsement_comments", (table) => {
      table.increments("id").primary();
      table.integer("endorsement_id").unsigned().notNullable();
      table.string("user_id", 50).notNullable();
      table.string("user_name", 100).notNullable();
      table.text("comment").notNullable();
      table.integer("likes").defaultTo(0);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());

      table.index("endorsement_id");
      table.index("user_id");
      table.index("created_at");

      table
        .foreign("endorsement_id")
        .references("id")
        .inTable("endorsements")
        .onDelete("CASCADE");
    });
  }

  // 6. Create endorsement_engagement_log table for analytics
  const logExists = await knex.schema.hasTable("endorsement_engagement_log");
  if (!logExists) {
    await knex.schema.createTable("endorsement_engagement_log", (table) => {
      table.increments("id").primary();
      table.integer("endorsement_id").unsigned().notNullable();
      table.string("action_type", 20).notNullable(); // like, view, share, comment, pin
      table.string("user_id", 50).nullable();
      table.string("ip_address", 45).nullable();
      table.json("metadata").nullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.index("endorsement_id");
      table.index("action_type");
      table.index("created_at");
      table.index(["endorsement_id", "action_type"]);

      table
        .foreign("endorsement_id")
        .references("id")
        .inTable("endorsements")
        .onDelete("CASCADE");
    });
  }

  // 7. Create function to calculate engagement score
  await knex.raw("DROP FUNCTION IF EXISTS calculate_engagement_score");
  await knex.raw(`
    CREATE FUNCTION calculate_engagement_score(
      p_likes INT,
      p_views INT,
      p_shares INT,
      p_comments INT,
      p_amount INT,
      p_created_at DATETIME
    ) RETURNS INT DETERMINISTIC
    BEGIN
      DECLARE score INT;
      DECLARE days_old INT;
      
      SET days_old = GREATEST(1, DATEDIFF(NOW(), p_created_at));
      SET score = (
        p_likes * 2 + 
        p_views * 0.5 + 
        p_shares * 3 + 
        p_comments * 2 + 
        (CASE WHEN p_amount > 0 THEN p_amount * 5 ELSE 0 END)
      );
      
      -- Apply time decay (newer content gets higher score)
      SET score = score / POW(days_old, 0.5);
      
      RETURN GREATEST(0, LEAST(10000, score));
    END
  `);

  // 8. Create trigger to update engagement score on engagement
  await knex.raw("DROP TRIGGER IF EXISTS update_endorsement_engagement_score");
  await knex.raw(`
    CREATE TRIGGER update_endorsement_engagement_score
    AFTER UPDATE ON endorsements
    FOR EACH ROW
    BEGIN
      IF NEW.likes != OLD.likes 
         OR NEW.views != OLD.views 
         OR NEW.shares != OLD.shares 
         OR NEW.comments != OLD.comments 
      THEN
        UPDATE endorsements 
        SET engagement_score = calculate_engagement_score(
          NEW.likes, NEW.views, NEW.shares, NEW.comments, 
          NEW.amount, NEW.created_at
        )
        WHERE id = NEW.id;
      END IF;
    END
  `);

  // 9. Create trigger to track views
  await knex.raw("DROP TRIGGER IF EXISTS track_endorsement_view");
  await knex.raw(`
    CREATE TRIGGER track_endorsement_view
    AFTER INSERT ON endorsement_views
    FOR EACH ROW
    BEGIN
      UPDATE endorsements 
      SET views = views + 1
      WHERE id = NEW.endorsement_id;
    END
  `);

  // 10. Create stored procedure to auto-pin high-engagement endorsements
  await knex.raw("DROP PROCEDURE IF EXISTS auto_pin_high_engagement_endorsements");
  await knex.raw(`
    CREATE PROCEDURE auto_pin_high_engagement_endorsements()
    BEGIN
      DECLARE done INT DEFAULT FALSE;
      DECLARE v_leader_id VARCHAR(50);
      DECLARE v_endorsement_id INT;
      DECLARE v_total_engagement INT;
      
      DECLARE cur CURSOR FOR 
        SELECT e.leader_id, e.id, (e.likes + e.views + e.shares + e.comments) as total_engagement
        FROM endorsements e
        WHERE e.is_pinned = 0 
          AND e.status = 'active'
          AND (e.likes + e.views + e.shares + e.comments) >= 1000
        ORDER BY total_engagement DESC;
      
      DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
      
      OPEN cur;
      
      read_loop: LOOP
        FETCH cur INTO v_leader_id, v_endorsement_id, v_total_engagement;
        IF done THEN
          LEAVE read_loop;
        END IF;
        
        -- Unpin other endorsements for this leader
        UPDATE endorsements 
        SET is_pinned = 0, pinned_at = NULL
        WHERE leader_id = v_leader_id AND is_pinned = 1;
        
        -- Pin this endorsement
        UPDATE endorsements 
        SET is_pinned = 1, pinned_at = NOW()
        WHERE id = v_endorsement_id;
        
      END LOOP;
      
      CLOSE cur;
    END
  `);

  // 11. Create event to auto-pin every hour
  await knex.raw("DROP EVENT IF EXISTS auto_pin_high_engagement_event");
  await knex.raw(`
    CREATE EVENT IF NOT EXISTS auto_pin_high_engagement_event
    ON SCHEDULE EVERY 1 HOUR
    DO
      CALL auto_pin_high_engagement_endorsements();
  `);

  // 12. Add indexes for performance optimization
  try {
    await knex.schema.table("endorsements", (table) => {
      table.index(["leader_id", "is_pinned", "pinned_at"]);
    });
  } catch (e) {
    console.log("Index leader_id_is_pinned_pinned_at may already exist");
  }

  try {
    await knex.schema.table("endorsements", (table) => {
      table.index(["status", "engagement_score"]);
    });
  } catch (e) {
    console.log("Index status_engagement_score may already exist");
  }

  try {
    await knex.schema.table("endorsements", (table) => {
      table.index(["created_at", "engagement_score"]);
    });
  } catch (e) {
    console.log("Index created_at_engagement_score may already exist");
  }

  // 13. Update existing endorsements with engagement scores
  await knex.raw(`
    UPDATE endorsements 
    SET engagement_score = calculate_engagement_score(
      likes, views, shares, comments, amount, created_at
    )
    WHERE engagement_score = 0;
  `);

  // 14. Create view for easy access to trending endorsements
  if (leadersTableExists) {
    await knex.raw(`
      CREATE OR REPLACE VIEW trending_endorsements AS
      SELECT 
        e.*,
        l.name as leader_name,
        l.image_url as leader_image,
        l.position_running_for as leader_position,
        (e.likes + e.views + e.shares + e.comments) as total_engagement,
        CASE 
          WHEN e.amount > 0 THEN 'paid'
          ELSE 'free'
        END as endorsement_type,
        CASE 
          WHEN e.is_pinned = 1 THEN 'pinned'
          WHEN e.engagement_score >= 500 THEN 'hot'
          WHEN e.engagement_score >= 200 THEN 'trending'
          ELSE 'normal'
        END as status_label
      FROM endorsements e
      JOIN leaders l ON e.leader_id = l.leader_id
      WHERE e.status = 'active'
      ORDER BY 
        e.is_pinned DESC,
        e.engagement_score DESC,
        e.created_at DESC;
    `);
  } else {
    console.log("⚠️ leaders table not found. Skipping trending_endorsements view creation.");
  }
};

exports.down = async function (knex) {
  // Drop view
  await knex.raw("DROP VIEW IF EXISTS trending_endorsements");

  // Drop event
  await knex.raw("DROP EVENT IF EXISTS auto_pin_high_engagement_event");

  // Drop stored procedure
  await knex.raw(
    "DROP PROCEDURE IF EXISTS auto_pin_high_engagement_endorsements",
  );

  // Drop triggers
  await knex.raw("DROP TRIGGER IF EXISTS track_endorsement_view");
  await knex.raw("DROP TRIGGER IF EXISTS update_endorsement_engagement_score");

  // Drop function
  await knex.raw("DROP FUNCTION IF EXISTS calculate_engagement_score");

  // Drop tables (in reverse order of creation)
  await knex.schema.dropTableIfExists("endorsement_engagement_log");
  await knex.schema.dropTableIfExists("endorsement_comments");
  await knex.schema.dropTableIfExists("endorsement_shares");
  await knex.schema.dropTableIfExists("endorsement_views");
  await knex.schema.dropTableIfExists("endorsement_likes");

  // Remove columns from endorsements table
  const hasIsPinned = await knex.schema.hasColumn("endorsements", "is_pinned");
  if (hasIsPinned) {
    await knex.schema.table("endorsements", (table) => {
      table.dropColumn("is_pinned");
      table.dropColumn("pinned_at");
      table.dropColumn("likes");
      table.dropColumn("views");
      table.dropColumn("shares");
      table.dropColumn("comments");
      table.dropColumn("engagement_score");
    });
  }
};
