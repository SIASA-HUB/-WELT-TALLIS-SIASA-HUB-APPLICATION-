// seed-default-users.js - Fixed with correct email field
const { pool, initDB } = require("./src/configurations/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const createDefaultUsers = async () => {
  console.log("🔧 Creating default users...");

  try {
    await initDB();

    // Default Market Admin
    const marketAdminEmail = "infowelttallis@gmail.com";
    const marketAdminUsername = "mumosisahub";
    const marketAdminPassword = "20671648";  // Updated password

    // Default Administrator
    const adminEmail = "infowelttallis@gmail.com";
    const adminUsername = "mumosiasahub";
    const adminPassword = "40045355";  // Same password for admin

    // Check if Market Admin exists
    const [existingMarketAdmin] = await pool.execute(
      "SELECT user_id FROM users WHERE personal_email = ? OR anonymous_username = ?",
      [marketAdminEmail, marketAdminUsername]
    );

    if (existingMarketAdmin.length === 0) {
      const hashedPassword = await hashPassword(marketAdminPassword);
      const user_id = `USR_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;

      await pool.execute(
        `INSERT INTO users (
          user_id, real_name, anonymous_username, personal_email, password_hash, 
          gender, age_bracket, generation, county, ward, 
          voter_card, will_vote, role, political_party, 
          employment_status, political_leanings, vote_frequency, 
          is_verified, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          user_id,
          "Mumo Siasa Hub",
          marketAdminUsername,
          marketAdminEmail,
          hashedPassword,
          "Male",
          "26-35",
          "Millennial",
          "Nairobi",
          "Central",
          1,
          1,
          "market_admin",
          "UDA",
          "Employed",
          "Pro-Government",
          "Always",
          1,
        ]
      );
      console.log(` Created default Market Admin: ${marketAdminUsername} (${marketAdminEmail})`);
    } else {
      console.log(` Market Admin already exists: ${marketAdminUsername}`);
    }

    // Check if Administrator exists
    const [existingAdmin] = await pool.execute(
      "SELECT user_id, role FROM users WHERE personal_email = ? OR anonymous_username = ?",
      [adminEmail, adminUsername]
    );

    if (existingAdmin.length === 0) {
      const hashedPassword = await hashPassword(adminPassword);
      const user_id = `USR_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;

      await pool.execute(
        `INSERT INTO users (
          user_id, real_name, anonymous_username, personal_email, password_hash, 
          gender, age_bracket, generation, county, ward, 
          voter_card, will_vote, role, political_party, 
          employment_status, political_leanings, vote_frequency, 
          is_verified, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          user_id,
          "Mumo Siasa Hub Admin",
          adminUsername,
          adminEmail,
          hashedPassword,
          "Male",
          "36-45",
          "Gen X",
          "Nairobi",
          "Central",
          1,
          1,
          "administrator",
          "UDA",
          "Employed",
          "Pro-Government",
          "Always",
          1,
        ]
      );
      console.log(`✅ Created default Administrator: ${adminUsername} (${adminEmail})`);
    } else if (existingAdmin[0].role !== "administrator") {
      // Update role if exists but wrong role
      await pool.execute(
        "UPDATE users SET role = 'administrator' WHERE user_id = ?",
        [existingAdmin[0].user_id]
      );
      console.log(` Updated existing user to Administrator: ${adminUsername}`);
    } else {
      console.log(`ℹAdministrator already exists: ${adminUsername}`);
    }

    console.log(" Default users setup complete!");
  } catch (error) {
    console.error(" Error creating default users:", error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
    process.exit(0);
  }
};

createDefaultUsers();