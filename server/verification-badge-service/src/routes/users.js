const express = require('express');
const router = express.Router();

const { createUser, loginUser, refreshToken,logoutUser } = require('../controllers/users');

// const usersRateLimiter = require('../middlewares/usersRateLimiter');

// ---------- USER CREATION (ANONYMOUS SIGNUP) ----------
router.post( '/create',   createUser);

// ---------- LOGIN ----------
router.post( '/login',  loginUser);

// ---------- REFRESH TOKEN ----------
router.post(  '/refresh',  refreshToken);

// ---------- LOGOUT ----------
router.post( '/logout',  logoutUser);

module.exports = router;
