const express = require('express');
const router = express.Router();

const   { createUser   ,   updateUser   }  = require('../controllers/createUser');
const { refreshToken,  loginUser } = require('../controllers/loginUser');

// ---------- CREATE USER ----------
router.post('/register', createUser);

// ---------- LOGIN ----------
router.post('/login', loginUser);




module.exports = router;
