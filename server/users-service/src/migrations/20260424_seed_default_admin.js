exports.up = function(knex) {
  return knex('users').where({ personal_email: 'infowelttallis@gmail.com' }).first().then(user => {
    if (!user) {
      return knex('users').insert({
        user_id: 'admin_default_001',
        anonymous_username: 'welt_tallis_admin',
        real_name: 'Welt Tallis Admin',
        personal_email: 'infowelttallis@gmail.com',
        password_hash: '$2b$10$3QLEQNNxGNPPfXi865rZ6uICmhA.bR6kWAY6MkAgjakKEtBAuU5GC',
        role: 'admin',
        created_at: knex.fn.now(),
        updated_at: knex.fn.now()
      });
    } else {
      return knex('users').where({ personal_email: 'infowelttallis@gmail.com' }).update({
        role: 'admin'
      });
    }
  });
};

exports.down = function(knex) {
  return knex('users').where({ personal_email: 'infowelttallis@gmail.com' }).del();
};
