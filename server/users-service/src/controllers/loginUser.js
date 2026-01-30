const Logger = require('../utils/logger/logger');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { getKenyaTimeISO } = require('../utils/timestamps/timeStamps');
const { safeQuery, safeQueryOne } = require('../configurations/db');

// Environment variables (make sure to set these in your .env)
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';








// ---------- LOGIN USER ----------
const loginUser = asyncHandler(async (req, res) => {
    const { anonymous_username } = req.body;

    if (!anonymous_username || typeof anonymous_username !== 'string') {
        return res.status(400).json({ message: 'Username is required' });
    }

    try {
        const user = await safeQueryOne(
            'SELECT * FROM users WHERE anonymous_username = ? LIMIT 1',
            [anonymous_username.trim()]
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate tokens
        const accessToken = jwt.sign(
            { userId: user.id, username: user.anonymous_username },
            ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        // Set cookies
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 15 * 60 * 1000
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Update last login
        await safeQuery(
            'UPDATE users SET updated_at = ? WHERE id = ?',
            [getKenyaTimeISO(), user.id]
        );

        Logger.info('User logged in', { username: anonymous_username });

        res.status(200).json({
            message: 'Login successful',
            success:   true,
            user: {
                id: user.user_id,
                anonymous_username: user.anonymous_username,
             
            }
        });

    } catch (error) {
        Logger.error('Login error', { error: error.message });
        res.status(500).json({ message: 'Internal server error' });
    }
});



// refresh  tokesn 
const refreshToken = asyncHandler(async (req, res) => {
    const token = req.cookies.refresh_token;
    if (!token) return res.status(401).json({ message: 'No refresh token provided' });

    try {
        const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
        const user = await safeQueryOne('SELECT * FROM users WHERE id = ?', [decoded.userId]);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Issue new access token
        const accessToken = jwt.sign(
            { userId: user.id, username: user.anonymous_username },
            ACCESS_TOKEN_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRES }
        );

        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000, // 15 minutes
            sameSite: 'Strict'
        });

        res.status(200).json({ message: 'Access token refreshed' });

    } catch (error) {
        Logger.error('Error refreshing token', { error: error.message });
        res.status(403).json({ message: 'Invalid refresh token' });
    }
});

// ---------- LOGOUT ----------
const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = {
 refreshToken, logoutUser   , loginUser
};
