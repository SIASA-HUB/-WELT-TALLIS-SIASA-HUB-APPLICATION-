const { safeQuery, safeQueryOne } = require('../configurations/db');
const asyncHandler = require('express-async-handler');
const KENYA_COUNTIES = require('../utils/kenyanCounty/counties');
const { randomUUID } = require('crypto');
const bcrypt = require('bcrypt');
const { getKenyaTimeISO } = require('../utils/timestamps/timeStamps');

const saltRounds = 10;

/* =====================================================
   HELPERS
===================================================== */
function generateUserId() {
  return `USR-${randomUUID().split('-').slice(0, 2).join('-')}`;
}

function generateAnonymousUserName() {
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `Anon-KE-${suffix}`;
}

/**
 * Maps the numeric age bracket to a Generation Label
 * This ensures your DB has a specific field for "generation"
 */
function getGenerationLabel(bracket) {
  const mapping = {
    '18-25': 'Gen Z',
    '26-35': 'Millennial',
    '36-45': 'Gen X',
    '46-55': 'Gen X',
    '56+':   'Boomer'
  };
  return mapping[bracket] || 'Unknown';
}

/* =====================================================
   CREATE USER
===================================================== */
const createUser = asyncHandler(async (req, res) => {
  const {
    gender,
    age_bracket, // Expected: "18-25", "26-35", etc.
    county,
    ward,
    voter_card,
    will_vote,
    password
  } = req.body;

  /* ---------- VALIDATION ---------- */
  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required'
    });
  }

  const validBrackets = ['18-25', '26-35', '36-45', '46-55', '56+'];
  if (age_bracket && !validBrackets.includes(age_bracket)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid age bracket'
    });
  }

  // Determine the generation label automatically
  const generation = age_bracket ? getGenerationLabel(age_bracket) : null;

  if (county) {
    const isValidCounty = KENYA_COUNTIES
      .map(c => c.toLowerCase())
      .includes(county.trim().toLowerCase());

    if (!isValidCounty) {
      return res.status(400).json({
        success: false,
        message: 'Invalid county'
      });
    }
  }

  /* ---------- UNIQUE ANON USERNAME ---------- */
  let anonymous_username;
  let exists = true;

  while (exists) {
    anonymous_username = generateAnonymousUserName();
    const user = await safeQueryOne(
      'SELECT id FROM users WHERE anonymous_username = ? LIMIT 1',
      [anonymous_username]
    );
    exists = !!user;
  }

  /* ---------- HASH PASSWORD ---------- */
  const passwordHash = await bcrypt.hash(password, saltRounds);

  /* ---------- INSERT USER ---------- */
  try {
    const user_id = generateUserId();
    const now = getKenyaTimeISO();

    const voterCardInt = voter_card === 'Yes' ? 1 : 0;
    const willVoteVal = will_vote === 'Yes' ? 1 : (will_vote === 'No' ? 0 : 2);

    await safeQuery(
      `
      INSERT INTO users
      (user_id, anonymous_username, gender, age_bracket, generation, county, ward,
       voter_card, will_vote, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        user_id,
        anonymous_username,
        gender || null,
        age_bracket || null, // Stores "18-25"
        generation,          // Stores "Gen Z", "Millennial", etc.
        county || null,
        ward || null,
        voterCardInt,
        willVoteVal,
        passwordHash,
        now,
        now
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      assignedUsername: anonymous_username 
    });

  } catch (error) {
    console.error('[createUser]', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});





/* =============================
   UPDATE USER
   ============================= */
const updateUser = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const { anonymous_username, county, ward } = req.body;

  if (!user_id) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  if (county) {
    const isValidCounty = KENYA_COUNTIES
      .map(c => c.toLowerCase())
      .includes(county.trim().toLowerCase());

    if (!isValidCounty) {
      return res.status(400).json({
        success: false,
        message: 'Invalid county'
      });
    }
  }

  try {
    const user = await safeQueryOne(
      'SELECT * FROM users WHERE user_id = ? LIMIT 1',
      [user_id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const fields = [];
    const values = [];

    if (anonymous_username) {
      fields.push('anonymous_username = ?');
      values.push(anonymous_username.trim());
    }

    if (county) {
      fields.push('county = ?');
      values.push(county.trim());
    }

    if (ward) {
      fields.push('ward = ?');
      values.push(ward.trim());
    }

    if (!fields.length) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    fields.push('updated_at = ?');
    values.push(getKenyaTimeISO());
    values.push(user_id);

    await safeQuery(
      `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`,
      values
    );

    return res.json({
      success: true,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('[updateUser]', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = {
  createUser,
  updateUser
};
