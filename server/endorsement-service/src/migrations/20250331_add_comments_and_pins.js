// migrations/20250331_add_comments_and_pins.js

exports.up = async function (knex) {
  // 1. Create endorsement_comments table with all columns including user_avatar
  const commentsExists = await knex.schema.hasTable("endorsement_comments");
  if (!commentsExists) {
    await knex.schema.createTable("endorsement_comments", (table) => {
      table.increments("id").primary();
      table.integer("endorsement_id").unsigned().notNullable();
      table.string("user_id", 50).notNullable();
      table.string("user_name", 100).notNullable();
      table.string("user_avatar", 500).nullable(); // This column exists
      table.text("comment").notNullable();
      table.integer("likes").defaultTo(0);
      table.boolean("is_pinned").defaultTo(false);
      table.timestamp("pinned_at").nullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());

      // Indexes
      table.index("endorsement_id");
      table.index("is_pinned");
      table.index("created_at");
      table.index(["endorsement_id", "is_pinned"]);
      table.index(["endorsement_id", "created_at"]);

      // Foreign key
      table
        .foreign("endorsement_id")
        .references("id")
        .inTable("endorsements")
        .onDelete("CASCADE");
    });
  } else {
    // Add missing columns if they don't exist
    const hasIsPinned = await knex.schema.hasColumn(
      "endorsement_comments",
      "is_pinned",
    );
    if (!hasIsPinned) {
      await knex.schema.table("endorsement_comments", (table) => {
        table.boolean("is_pinned").defaultTo(false);
        table.timestamp("pinned_at").nullable();
        table.index("is_pinned");
      });
    }

    // Add user_avatar if it doesn't exist
    const hasUserAvatar = await knex.schema.hasColumn(
      "endorsement_comments",
      "user_avatar",
    );
    if (!hasUserAvatar) {
      await knex.schema.table("endorsement_comments", (table) => {
        table.string("user_avatar", 500).nullable();
      });
    }
  }

  // 2. Create comment_likes table
  const likesExists = await knex.schema.hasTable("comment_likes");
  if (!likesExists) {
    await knex.schema.createTable("comment_likes", (table) => {
      table.increments("id").primary();
      table.integer("comment_id").unsigned().notNullable();
      table.string("user_id", 50).notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());

      // Unique constraint to prevent duplicate likes
      table.unique(["comment_id", "user_id"]);

      // Indexes
      table.index("comment_id");
      table.index("user_id");
      table.index(["comment_id", "user_id"]);

      // Foreign key
      table
        .foreign("comment_id")
        .references("id")
        .inTable("endorsement_comments")
        .onDelete("CASCADE");
    });
  }

  // 3. Add indexes to endorsements table for performance
  try {
    const hasIsPinnedEndorsement = await knex.schema.hasColumn(
      "endorsements",
      "is_pinned",
    );
    if (hasIsPinnedEndorsement) {
      try {
        await knex.schema.table("endorsements", (table) => {
          table.index("is_pinned", "idx_is_pinned");
        });
      } catch (e) {
        console.log("Index idx_is_pinned may already exist");
      }

      try {
        await knex.schema.table("endorsements", (table) => {
          table.index("pinned_at", "idx_pinned_at");
        });
      } catch (e) {
        console.log("Index idx_pinned_at may already exist");
      }

      try {
        await knex.schema.table("endorsements", (table) => {
          table.index("comments", "idx_comments");
        });
      } catch (e) {
        console.log("Index idx_comments may already exist");
      }
    }
  } catch (error) {
    console.log("Error adding indexes:", error.message);
  }

  // 4. Create triggers
  await knex.raw(`
    DROP TRIGGER IF EXISTS update_endorsement_comments_count_insert
  `);

  await knex.raw(`
    DROP TRIGGER IF EXISTS update_endorsement_comments_count_delete
  `);

  await knex.raw(`
    CREATE TRIGGER update_endorsement_comments_count_insert
    AFTER INSERT ON endorsement_comments
    FOR EACH ROW
    BEGIN
      UPDATE endorsements 
      SET comments = comments + 1,
          engagement_score = (likes + views + shares + comments + 1)
      WHERE id = NEW.endorsement_id;
    END
  `);

  await knex.raw(`
    CREATE TRIGGER update_endorsement_comments_count_delete
    AFTER DELETE ON endorsement_comments
    FOR EACH ROW
    BEGIN
      UPDATE endorsements 
      SET comments = GREATEST(comments - 1, 0),
          engagement_score = GREATEST((likes + views + shares + comments - 1), 0)
      WHERE id = OLD.endorsement_id;
    END
  `);

  // 5. Create comment likes triggers
  await knex.raw(`
    DROP TRIGGER IF EXISTS update_comment_likes_count_insert
  `);

  await knex.raw(`
    DROP TRIGGER IF EXISTS update_comment_likes_count_delete
  `);

  await knex.raw(`
    CREATE TRIGGER update_comment_likes_count_insert
    AFTER INSERT ON comment_likes
    FOR EACH ROW
    BEGIN
      UPDATE endorsement_comments 
      SET likes = likes + 1
      WHERE id = NEW.comment_id;
    END
  `);

  await knex.raw(`
    CREATE TRIGGER update_comment_likes_count_delete
    AFTER DELETE ON comment_likes
    FOR EACH ROW
    BEGIN
      UPDATE endorsement_comments 
      SET likes = GREATEST(likes - 1, 0)
      WHERE id = OLD.comment_id;
    END
  `);

  // 6. Create stored procedure
  await knex.raw(`
    DROP PROCEDURE IF EXISTS auto_pin_top_comments
  `);

  await knex.raw(`
    CREATE PROCEDURE auto_pin_top_comments()
    BEGIN
      DECLARE done INT DEFAULT FALSE;
      DECLARE v_endorsement_id INT;
      DECLARE v_comment_id INT;
      DECLARE v_engagement INT;
      
      DECLARE cur CURSOR FOR 
        SELECT e.id, c.id, (c.likes + 1) as engagement
        FROM endorsements e
        JOIN endorsement_comments c ON e.id = c.endorsement_id
        WHERE e.comments >= 10 
          AND c.is_pinned = 0
          AND c.likes >= 5
        ORDER BY engagement DESC
        LIMIT 1;
      
      DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
      
      OPEN cur;
      
      read_loop: LOOP
        FETCH cur INTO v_endorsement_id, v_comment_id, v_engagement;
        IF done THEN
          LEAVE read_loop;
        END IF;
        
        UPDATE endorsement_comments 
        SET is_pinned = 0, pinned_at = NULL
        WHERE endorsement_id = v_endorsement_id AND is_pinned = 1;
        
        UPDATE endorsement_comments 
        SET is_pinned = 1, pinned_at = NOW()
        WHERE id = v_comment_id;
        
      END LOOP;
      
      CLOSE cur;
    END
  `);

  // 7. Create event to auto-pin comments every hour
  await knex.raw(`
    DROP EVENT IF EXISTS auto_pin_top_comments_event
  `);

  await knex.raw(`
    CREATE EVENT IF NOT EXISTS auto_pin_top_comments_event
    ON SCHEDULE EVERY 1 HOUR
    DO
      CALL auto_pin_top_comments()
  `);

  // 8. Create view for easy access to endorsement comments with engagement
  await knex.raw(`
    DROP VIEW IF EXISTS endorsement_comments_view
  `);

  await knex.raw(`
    CREATE VIEW endorsement_comments_view AS
    SELECT 
      c.id,
      c.endorsement_id,
      c.user_id,
      c.user_name,
      IFNULL(c.user_avatar, '') as user_avatar,
      c.comment,
      c.likes,
      c.is_pinned,
      c.pinned_at,
      c.created_at,
      e.leader_id,
      e.user_id as endorsement_user_id,
      e.user_name as endorsement_user_name,
      e.amount as endorsement_amount,
      e.phrase as endorsement_phrase,
      (c.likes + 1) as engagement_score,
      CASE 
        WHEN c.is_pinned = 1 THEN 'pinned'
        WHEN c.likes >= 10 THEN 'trending'
        WHEN c.likes >= 5 THEN 'popular'
        ELSE 'normal'
      END as status_label
    FROM endorsement_comments c
    JOIN endorsements e ON c.endorsement_id = e.id
    WHERE e.status = 'active'
    ORDER BY c.is_pinned DESC, c.created_at DESC
  `);

  console.log("✅ Migration 20250331_add_comments_and_pins completed");
};

exports.down = async function (knex) {
  // Drop view
  await knex.raw("DROP VIEW IF EXISTS endorsement_comments_view");

  // Drop event
  await knex.raw("DROP EVENT IF EXISTS auto_pin_top_comments_event");

  // Drop stored procedure
  await knex.raw("DROP PROCEDURE IF EXISTS auto_pin_top_comments");

  // Drop triggers
  await knex.raw("DROP TRIGGER IF EXISTS update_comment_likes_count_insert");
  await knex.raw("DROP TRIGGER IF EXISTS update_comment_likes_count_delete");
  await knex.raw(
    "DROP TRIGGER IF EXISTS update_endorsement_comments_count_insert",
  );
  await knex.raw(
    "DROP TRIGGER IF EXISTS update_endorsement_comments_count_delete",
  );

  // Drop indexes from endorsements table
  try {
    const hasIsPinned = await knex.schema.hasColumn(
      "endorsements",
      "is_pinned",
    );
    if (hasIsPinned) {
      await knex.schema.table("endorsements", (table) => {
        table.dropIndex("is_pinned", "idx_is_pinned");
        table.dropIndex("pinned_at", "idx_pinned_at");
        table.dropIndex("comments", "idx_comments");
      });
    }
  } catch (error) {
    console.log("Error dropping indexes:", error.message);
  }

  // Drop tables in reverse order
  await knex.schema.dropTableIfExists("comment_likes");
  await knex.schema.dropTableIfExists("endorsement_comments");

  console.log("✅ Migration 20250331_add_comments_and_pins rolled back");
};
