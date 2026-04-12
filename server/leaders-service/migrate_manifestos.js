require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'ballot'
  });

  try {
    console.log('Running manifesto normalization migration...\n');

    // 1. manifesto_agendas table
    const [agTables] = await conn.execute("SHOW TABLES LIKE 'manifesto_agendas'");
    if (agTables.length === 0) {
      await conn.execute(`
        CREATE TABLE manifesto_agendas (
          id VARCHAR(36) PRIMARY KEY,
          manifesto_id VARCHAR(36) NOT NULL,
          title VARCHAR(500) NOT NULL,
          description TEXT,
          votes_count INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_manifesto_id (manifesto_id),
          FOREIGN KEY (manifesto_id) REFERENCES manifestos(manifesto_id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Created manifesto_agendas table');
    } else {
      console.log('-- manifesto_agendas table already exists');
    }

    // 2. agenda_votes table
    const [avTables] = await conn.execute("SHOW TABLES LIKE 'agenda_votes'");
    if (avTables.length === 0) {
      await conn.execute(`
        CREATE TABLE agenda_votes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          agenda_id VARCHAR(36) NOT NULL,
          user_id VARCHAR(100) NOT NULL,
          vote_type VARCHAR(20) NOT NULL DEFAULT 'approve',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_user_agenda (agenda_id, user_id),
          INDEX idx_agenda_id (agenda_id),
          INDEX idx_user_id (user_id),
          FOREIGN KEY (agenda_id) REFERENCES manifesto_agendas(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Created agenda_votes table');
    } else {
      console.log('-- agenda_votes table already exists');
    }

    // 3. manifesto_views table
    const [mvTables] = await conn.execute("SHOW TABLES LIKE 'manifesto_views'");
    if (mvTables.length === 0) {
      await conn.execute(`
        CREATE TABLE manifesto_views (
          id INT AUTO_INCREMENT PRIMARY KEY,
          manifesto_id VARCHAR(36) NOT NULL,
          user_id VARCHAR(100) NULL,
          read_time INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_manifesto_id (manifesto_id),
          FOREIGN KEY (manifesto_id) REFERENCES manifestos(manifesto_id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Created manifesto_views table');
    } else {
      console.log('-- manifesto_views table already exists');
    }

    // 4. Migrate existing JSON agenda_items into manifesto_agendas
    const [manifestos] = await conn.execute(
      'SELECT manifesto_id, agenda_items FROM manifestos WHERE agenda_items IS NOT NULL AND agenda_items != "" AND agenda_items != "[]"'
    );
    console.log(`\nFound ${manifestos.length} manifestos with JSON agenda_items to migrate`);

    const { randomUUID } = require('crypto');
    let migrated = 0;
    for (const m of manifestos) {
      let items;
      try { items = typeof m.agenda_items === 'string' ? JSON.parse(m.agenda_items) : m.agenda_items; }
      catch { continue; }

      if (!Array.isArray(items) || items.length === 0) continue;

      // Check if already migrated
      const [existing] = await conn.execute(
        'SELECT COUNT(*) as cnt FROM manifesto_agendas WHERE manifesto_id = ?',
        [m.manifesto_id]
      );
      if (existing[0].cnt > 0) continue;

      for (const item of items) {
        if (!item.title && !item.description) continue;
        await conn.execute(
          `INSERT IGNORE INTO manifesto_agendas (id, manifesto_id, title, description, votes_count, created_at, updated_at)
           VALUES (?, ?, ?, ?, 0, NOW(), NOW())`,
          [item.id || randomUUID(), m.manifesto_id, item.title || 'Agenda Item', item.description || '']
        );
        migrated++;
      }
    }
    console.log(`✅ Migrated ${migrated} agenda items`);

    console.log('\n✅ All migrations completed successfully!');
    await conn.end();
  } catch (e) {
    console.error('❌ Migration error:', e.message);
    await conn.end();
    process.exit(1);
  }
})();
