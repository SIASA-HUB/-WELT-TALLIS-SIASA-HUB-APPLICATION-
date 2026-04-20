/**
 * Fixes the recursive trigger problem where an AFTER UPDATE trigger 
 * was trying to execute an UPDATE on the same table.
 */
exports.up = async function (knex) {
  // 1. Drop the problematic AFTER UPDATE trigger
  await knex.raw(`DROP TRIGGER IF EXISTS update_endorsement_engagement_score`);

  // 2. Create the correct BEFORE UPDATE trigger
  // This trigger directly modifies the NEW row before it is saved, 
  // avoiding a recursive UPDATE statement.
  await knex.raw(`
    CREATE TRIGGER update_endorsement_engagement_score
    BEFORE UPDATE ON endorsements
    FOR EACH ROW
    BEGIN
        -- Avoid unnecessary calculation if relevant columns haven't changed
        IF (NEW.likes != OLD.likes 
            OR NEW.views != OLD.views 
            OR NEW.shares != OLD.shares 
            OR NEW.comments != OLD.comments
            OR NEW.amount != OLD.amount) THEN
            
            -- Calculate engagement score and set it on the NEW row directly
            -- Formula: (likes*2 + views*0.5 + shares*3 + comments*2 + points) / (age_in_days^0.5)
            SET NEW.engagement_score = GREATEST(0, LEAST(10000, 
                (NEW.likes * 2 + NEW.views * 0.5 + NEW.shares * 3 + NEW.comments * 2 + 
                 CASE WHEN NEW.amount > 0 THEN NEW.amount * 5 ELSE 0 END) / 
                GREATEST(1, SQRT(DATEDIFF(NOW(), NEW.created_at) + 1))
            ));
        END IF;
    END
  `);
};

exports.down = async function (knex) {
  await knex.raw(`DROP TRIGGER IF EXISTS update_endorsement_engagement_score`);
  
  // Revert to the version with session variable check (even though it was broken)
  await knex.raw(`
    CREATE TRIGGER update_endorsement_engagement_score
    AFTER UPDATE ON endorsements
    FOR EACH ROW
    BEGIN
        IF @disable_engagement_trigger IS NULL THEN
            IF (NEW.likes != OLD.likes 
                OR NEW.views != OLD.views 
                OR NEW.shares != OLD.shares 
                OR NEW.comments != OLD.comments) THEN
                
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
