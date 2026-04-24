const knex = require('knex')(require('../knexfile').development);
knex('users').where({ personal_email: 'infowelttallis@gmail.com' }).first().then(user => {
  console.log(JSON.stringify(user, null, 2));
  process.exit(0);
});
