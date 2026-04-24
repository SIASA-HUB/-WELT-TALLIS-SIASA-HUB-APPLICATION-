const bcrypt = require('bcryptjs');
const password = '40045355';
bcrypt.hash(password, 10).then(hash => {
  console.log(hash);
});
