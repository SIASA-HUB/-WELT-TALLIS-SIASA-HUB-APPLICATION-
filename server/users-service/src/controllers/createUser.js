

const   Logger   =   require('../utils/logger/logger')
const   { safeQuery  ,  safeQueryOne }    =  require('../configurations/db')


const   KENYA_COUNTIES   =   require('../utils/counties/counties')



const { randomUUID } = require('crypto');




function generateUserId() {
    return `USR-${randomUUID().split('-').slice(0, 2).join('-')}`;
}




const createUser = asyncHandler(async (req, res) => {
    const {
        anonymous_username,
        gender,
        age_bracket,
        county,
        ward,
        voter_card,
        will_vote
    } = req.body;

    // ---------- Validation ----------
    if (!anonymous_username || typeof anonymous_username !== 'string' || anonymous_username.trim() === '') {
        return res.status(400).json({ success: false, message: 'Username is required' });
    }

    if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
        return res.status(400).json({ success: false, message: 'Invalid gender' });
    }

    if (age_bracket && !['GenZ', 'Millennial', 'GenX', 'Boomer'].includes(age_bracket)) {
        return res.status(400).json({ success: false, message: 'Invalid age bracket' });
    }

    if (county) {
        const isValidCounty = KENYA_COUNTIES
            .map(c => c.toLowerCase())
            .includes(county.trim().toLowerCase());

        if (!isValidCounty) {
            return res.status(400).json({ success: false, message: 'Invalid county' });
        }
    }

    try {
        // Check username uniqueness
        const existingUser = await safeQueryOne(
            'SELECT id FROM users WHERE anonymous_username = ? LIMIT 1',
            [anonymous_username.trim()]
        );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Username already exists'
            });
        }

        const now = getKenyaTimeISO();
        const user_id = generateUserId();

        await safeQuery(
            `
            INSERT INTO users
            (user_id, anonymous_username, gender, age_bracket, ward, voter_card, will_vote, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                user_id,
                anonymous_username.trim(),
                gender || null,
                age_bracket || null,
                ward || null,
                voter_card ? 1 : 0,
                will_vote ? 1 : 0,
                now,
                now
            ]
        );

        Logger.info('User created', { user_id, username: anonymous_username });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                anonymous_username
            }
        });

    } catch (error) {
        Logger.error('Create user error', { error: error.message });
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});



module.exports   =    createUser;
