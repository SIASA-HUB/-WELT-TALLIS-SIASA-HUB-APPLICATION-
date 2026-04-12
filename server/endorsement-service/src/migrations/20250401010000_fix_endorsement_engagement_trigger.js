// migrations/20250401_update_trigger_with_session_variable.js

exports.up = async function (knex) {
  // Drop existing trigger
  await knex.raw(`
    DROP TRIGGER IF EXISTS update_endorsement_engagement_score
  `);

  // Create updated trigger that respects the session variable
  await knex.raw(`
    CREATE TRIGGER update_endorsement_engagement_score
    AFTER UPDATE ON endorsements
    FOR EACH ROW
    BEGIN
        -- Skip if trigger is disabled via session variable
        IF @disable_engagement_trigger IS NULL THEN
            -- Check if engagement-related columns changed
            IF (NEW.likes != OLD.likes 
                OR NEW.views != OLD.views 
                OR NEW.shares != OLD.shares 
                OR NEW.comments != OLD.comments) THEN
                
                -- Update engagement score directly without function call
                UPDATE endorsements 
                SET engagement_score = GREATEST(0, LEAST(10000, 
                    (NEW.likes * 2 + NEW.views * 0.5 + NEW.shares * 3 + NEW.comments * 2 + 
                     CASE WHEN NEW.amount > 0 THEN NEW.amount * 5 ELSE 0 END) / 
                    GREATEST(1, DATEDIFF(NOW(), NEW.created_at) + 1)
                ))
                WHERE id = NEW.id;
            END IF;
        END IF;
    END
  `);
};

exports.down = async function (knex) {
  await knex.raw(`
    DROP TRIGGER IF EXISTS update_endorsement_engagement_score
  `);

  // Restore original trigger
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
};
