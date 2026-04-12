// 20250407_add_new_user_fields.js - Fixed to check if columns exist
const TABLE_NAME = 'users';

exports.up = async function(knex) {
  // Check existing columns first
  const hasPoliticalLeanings = await knex.schema.hasColumn(TABLE_NAME, 'political_leanings');
  const hasVoteFrequency = await knex.schema.hasColumn(TABLE_NAME, 'vote_frequency');
  const hasPersonalEmail = await knex.schema.hasColumn(TABLE_NAME, 'personal_email');
  
  // Only add columns that don't exist
  if (!hasPoliticalLeanings) {
    await knex.schema.table(TABLE_NAME, (table) => {
      table.enum('political_leanings', ['Pro-Government', 'Opposition', 'Undecided', 'Prefer not to say'])
        .defaultTo('Prefer not to say');
    });
  }
  
  if (!hasVoteFrequency) {
    await knex.schema.table(TABLE_NAME, (table) => {
      table.enum('vote_frequency', ['Always', 'Sometimes', 'Rarely', 'Never', 'First-time voter', 'Prefer not to say'])
        .defaultTo('Prefer not to say');
    });
  }
  
  if (!hasPersonalEmail) {
    await knex.schema.table(TABLE_NAME, (table) => {
      table.string('personal_email', 255).nullable().unique();
    });
  }
};

exports.down = async function(knex) {
  // Only drop columns if they exist
  const hasPoliticalLeanings = await knex.schema.hasColumn(TABLE_NAME, 'political_leanings');
  const hasVoteFrequency = await knex.schema.hasColumn(TABLE_NAME, 'vote_frequency');
  const hasPersonalEmail = await knex.schema.hasColumn(TABLE_NAME, 'personal_email');
  
  if (hasPoliticalLeanings) {
    await knex.schema.table(TABLE_NAME, (table) => {
      table.dropColumn('political_leanings');
    });
  }
  
  if (hasVoteFrequency) {
    await knex.schema.table(TABLE_NAME, (table) => {
      table.dropColumn('vote_frequency');
    });
  }
  
  if (hasPersonalEmail) {
    await knex.schema.table(TABLE_NAME, (table) => {
      table.dropColumn('personal_email');
    });
  }
};