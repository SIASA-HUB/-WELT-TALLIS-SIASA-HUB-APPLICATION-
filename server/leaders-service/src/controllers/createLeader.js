const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Logger = require('../utils/logger/logger');
const { safeQuery, safeQueryOne } = require('../configurations/db');
const { getKenyaTimeISO } = require('../utils/timestamps/timeStamp');
const redisClient = require('../utils/redis/redis');

// Helper function to parse tags from string
const parseTags = (tagsString) => {
    if (!tagsString) return [];
    
    try {
        const parsed = JSON.parse(tagsString);
        
        if (Array.isArray(parsed)) {
            return parsed.filter(tag => typeof tag === 'string');
        } else if (typeof parsed === 'object') {
            const allTags = [];
            Object.values(parsed).forEach(value => {
                if (Array.isArray(value)) {
                    value.forEach(item => {
                        if (typeof item === 'string') allTags.push(item);
                    });
                } else if (typeof value === 'string') {
                    allTags.push(value);
                }
            });
            return allTags;
        }
    } catch (error) {
        console.error('Error parsing tags:', error);
    }
    
    return [];
};

// Helper function to extract position from tags
const extractPosition = (tags) => {
    if (!tags || !Array.isArray(tags)) return 'Leader';
    
    const positionKeywords = ['MP', 'Senator', 'Governor', 'MCA', 'President', 'Deputy President', 'EALA', 'Member', 'MP for', 'Representative'];
    
    for (const tag of tags) {
        if (typeof tag !== 'string') continue;
        
        for (const keyword of positionKeywords) {
            if (tag.toLowerCase().includes(keyword.toLowerCase())) {
                return tag;
            }
        }
    }
    
    return 'Leader';
};

// Helper function to extract education from tags
const extractEducation = (tags) => {
    if (!tags || !Array.isArray(tags)) return 'Higher Education';
    
    const educationKeywords = ['Bachelor', 'Master', 'Degree', 'Diploma', 'University', 'College', 'Education', 'School', 'PhD', 'Doctorate'];
    
    for (const tag of tags) {
        if (typeof tag !== 'string') continue;
        
        for (const keyword of educationKeywords) {
            if (tag.toLowerCase().includes(keyword.toLowerCase())) {
                return tag;
            }
        }
    }
    
    return 'Higher Education';
};

// Helper function to extract county from location
const extractCounty = (location) => {
    if (!location) return 'Kenya';
    
    const locationStr = location.toString();
    const locationLower = locationStr.toLowerCase();
    
    const countyMappings = [
        { keywords: ['nairobi'], county: 'Nairobi' },
        { keywords: ['mombasa'], county: 'Mombasa' },
        { keywords: ['kisumu'], county: 'Kisumu' },
        { keywords: ['nakuru'], county: 'Nakuru' },
        { keywords: ['kiambu'], county: 'Kiambu' },
        { keywords: ['kakamega'], county: 'Kakamega' },
        { keywords: ['bungoma'], county: 'Bungoma' },
        { keywords: ['meru'], county: 'Meru' },
        { keywords: ['kisii'], county: 'Kisii' },
        { keywords: ['nyeri'], county: 'Nyeri' },
        { keywords: ['machakos'], county: 'Machakos' }
    ];
    
    for (const mapping of countyMappings) {
        for (const keyword of mapping.keywords) {
            if (locationLower.includes(keyword)) {
                return mapping.county;
            }
        }
    }
    
    return 'Kenya';
};

// Transform leader data
const transformLeaderData = (leader, index) => {
    const totalVotes = (leader.likes || 0) + (leader.dislikes || 0);
    const approval = totalVotes > 0 
        ? Math.round(((leader.likes || 0) / totalVotes) * 100)
        : Math.floor(Math.random() * 30) + 50;

    const engagements = (leader.views || 0) + (leader.comments_count || 0);
    const followers = Math.floor(approval * 1000 + (leader.likes || 0) * 10);

    return {
        id: leader.leader_id || `leader-${index}`,
        name: leader.name || 'Unknown Leader',
        party: leader.party || 'INDEPENDENT',
        position: leader.position || 'Political Leader',
        county: leader.location || 'Kenya',
        image_url: leader.image_url || '',
        approval: approval,
        followers: followers,
        engagements: engagements,
        trending: Math.floor(Math.random() * 100),
        support: approval,
        views: leader.views || 0,
        likes: leader.likes || 0,
        dislikes: leader.dislikes || 0,
        comments: leader.comments_count || 0,
        verified: leader.verification === 1,
        education: leader.education || 'Not specified',
        performance: Math.floor(Math.random() * 40) + 60
    };
};

// ========== CREATE LEADER ==========
const createLeader = asyncHandler(async (req, res) => {
    const { name, tags, ...optionalData } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
        Logger.error('Missing required field: name', { reqBody: req.body });
        return res.status(400).json({ 
            success: false,
            message: 'Leader name is required' 
        });
    }

    try {
        const leaderId = `LEAD-${crypto.randomBytes(4).toString('hex')}-${Date.now()}`;
        const created_at = getKenyaTimeISO();
        const updated_at = getKenyaTimeISO();

        const formattedTags = tags ? JSON.stringify(tags) : JSON.stringify([]);

        if (req.body.images && req.body.images.length > 0) {
            optionalData.image_url = req.body.images[0].url; 
        }
        delete optionalData.images;

        const columns = ['leader_id', 'name', 'tags', 'created_at', 'updated_at', ...Object.keys(optionalData)];
        const placeholders = columns.map(() => '?').join(', ');
        const values = [leaderId, name.trim(), formattedTags, created_at, updated_at, ...Object.values(optionalData)];

        await safeQuery(`INSERT INTO leaders (${columns.join(', ')}) VALUES (${placeholders})`, values);

        const leaderObj = {
            leader_id: leaderId,
            name: name.trim(),
            tags: formattedTags,
            created_at,
            updated_at,
            ...optionalData
        };

        // Update global leaders cache in Redis
        const globalLeadersKey = 'global:all_leaders';
        const cachedGlobal = await redisClient.get(globalLeadersKey);
        let leadersList = cachedGlobal ? JSON.parse(cachedGlobal) : [];

        leadersList.unshift(leaderObj);
        await redisClient.set(globalLeadersKey, JSON.stringify(leadersList), { EX: 3600 });

        // Update public feed cache
        const userCacheKey = 'user:public:leaders';
        const publicFeed = await redisClient.get(userCacheKey);
        let publicLeaders = publicFeed ? JSON.parse(publicFeed) : [];
        publicLeaders.unshift(leaderObj);
        await redisClient.set(userCacheKey, JSON.stringify(publicLeaders), { EX: 120 });

        Logger.info('Leader created and cached successfully', { leaderId, name });

        res.status(201).json({
            success: true,
            message: 'Leader registered successfully',
            leader: leaderObj
        });
    } catch (error) {
        Logger.error('Error occurred while registering leader', { error: error.message, stack: error.stack });
        res.status(500).json({ 
            success: false,
            message: 'Internal server error'
        });
    }
});

// ========== GET ALL LEADERS ==========
const getAllLeaders = asyncHandler(async (req, res) => {
    try {
        const cacheKey = 'global:all_leaders';
        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
            const leaders = JSON.parse(cachedData);
            const transformedLeaders = leaders.map((leader, index) => transformLeaderData(leader, index));
            
            return res.status(200).json({
                success: true,
                source: 'redis',
                count: transformedLeaders.length,
                data: transformedLeaders
            });
        }

        const leaders = await safeQuery(`
            SELECT leader_id, name, party, location, position, likes, dislikes, views, comments_count, image_url, verification, education
            FROM leaders WHERE status = 'active' LIMIT 50
        `);

        const transformedLeaders = leaders.map((leader, index) => transformLeaderData(leader, index));

        await redisClient.set(cacheKey, JSON.stringify(leaders), { EX: 3600 });

        res.status(200).json({
            success: true,
            source: 'database',
            count: transformedLeaders.length,
            data: transformedLeaders
        });
    } catch (error) {
        Logger.error('Error in getAllLeaders:', error);
        res.status(500).json({ success: false, message: 'Error fetching leaders' });
    }
});













const getLeaderById = asyncHandler(async (req, res) => {
    const { leaderId } = req.params;

    Logger.info('[GET LEADER] Incoming request', { leaderId });

    if (!leaderId) {
        return res.status(400).json({
            success: false,
            message: 'leaderId is required'
        });
    }

    const cacheKey = `leader:${leaderId}`;

    try {
        // ================= CLEAR CACHE =================
        try {
            await redisClient.del(cacheKey);
            Logger.info('[REDIS] Cache cleared for leader', { leaderId });
        } catch (err) {
            Logger.error('[REDIS CLEAR ERROR]', err.message);
        }

        // ================= LEADER CORE =================
        Logger.info('[DB] Fetching leader core data');
        const leader = await safeQueryOne(
            `SELECT 
                leader_id,
                name,
                party,
                location,
                tags,
                status,
                image_url,
                created_at,
                updated_at,
                position,
                county,
                constituency,
                ward,
                verification
            FROM leaders
            WHERE leader_id = ?`,
            [leaderId]
        );

        if (!leader) {
            return res.status(404).json({
                success: false,
                message: 'Leader not found'
            });
        }

        // ================= PARSE TAGS =================
        let parsedTags = [];
        let education = [];
        try {
            parsedTags = JSON.parse(leader.tags || '[]');
            parsedTags.forEach(item => {
                if (typeof item === 'object' && item.education) {
                    education = item.education;
                }
            });
        } catch (err) {
            Logger.error('[TAGS PARSE ERROR]', err.message);
        }

        // ================= STATS =================
        const [likes, dislikes, views, followers] = await Promise.all([
            safeQueryOne(`SELECT COUNT(*) AS count FROM leader_likes WHERE leader_id = ?`, [leaderId]),
            safeQueryOne(`SELECT COUNT(*) AS count FROM leader_dislikes WHERE leader_id = ?`, [leaderId]),
            safeQueryOne(`SELECT COUNT(*) AS count FROM leader_views WHERE leader_id = ?`, [leaderId]),
            safeQueryOne(`SELECT COUNT(*) AS count FROM leader_followers WHERE leader_id = ?`, [leaderId])
        ]);

        // ================= PORTFOLIO/SOCIAL LINKS =================
        Logger.info('[DB] Fetching leader portfolio/social links');
        const portfolioLinks = await safeQuery(
            `SELECT type, url FROM leader_portfolio WHERE leader_id = ?`,
            [leaderId]
        );

        // ================= RESPONSE =================
        const response = {
            ...leader,
            stats: {
                likes: likes?.count || 0,
                dislikes: dislikes?.count || 0,
                views: views?.count || 0,
                followers: followers?.count || 0
            },
            parsed_tags: parsedTags,
            education,
            portfolio: portfolioLinks || []
        };

        // ================= CACHE =================
        try {
            await redisClient.set(cacheKey, JSON.stringify(response), { EX: 600 }); // cache 10 mins
            Logger.info('[REDIS] Cache set', { leaderId });
        } catch (err) {
            Logger.error('[REDIS SET ERROR]', err.message);
        }

        return res.status(200).json({
            success: true,
            source: 'database',
            data: response
        });

    } catch (error) {
        Logger.error('[GET LEADER FATAL]', {
            message: error.message,
            stack: error.stack
        });

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});






// ========================
const createLeaderPortfolio = asyncHandler(async (req, res) => {
    const { leader_id, type, url } = req.body;

    // ============ VALIDATION ============
    if (!leader_id) {
        res.status(400);
        throw new Error('leader_id is required');
    }
    if (!type) {
        res.status(400);
        throw new Error('type is required (website, facebook, instagram, twitter, tiktok, linkedin, youtube, other)');
    }
    if (!url) {
        res.status(400);
        throw new Error('url is required');
    }

    try {
        // Optional: validate type against allowed types
        const allowedTypes = ['website','facebook','instagram','twitter','tiktok','linkedin','youtube','other'];
        if (!allowedTypes.includes(type)) {
            res.status(400);
            throw new Error(`type must be one of: ${allowedTypes.join(', ')}`);
        }

        // Insert into DB
        const result = await safeQuery(
            `INSERT INTO leader_portfolio (leader_id, type, url) VALUES (?, ?, ?)`,
            [leader_id, type, url]
        );

        Logger.info(`[Leader Portfolio] Added ${type} link for leader ${leader_id}`);

        res.status(201).json({
            success: true,
            message: 'Portfolio link added successfully',
            data: {
                id: result.insertId,
                leader_id,
                type,
                url
            }
        });
    } catch (error) {
        Logger.error('[CREATE LEADER PORTFOLIO ERROR]', { message: error.message });
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});












// ========== EDIT LEADER ==========
const editLeader = asyncHandler(async (req, res) => {
    const { leaderId } = req.params;
    const { name, tags, image_url, party, location } = req.body;

    if (!leaderId) return res.status(400).json({ success: false, message: 'Leader ID is required' });

    try {
        const updated_at = getKenyaTimeISO();
        const query = `
            UPDATE leaders 
            SET name = COALESCE(?, name), 
                tags = COALESCE(?, tags), 
                image_url = COALESCE(?, image_url),
                party = COALESCE(?, party),
                location = COALESCE(?, location),
                updated_at = ? 
            WHERE leader_id = ?`;

        const values = [name || null, tags ? JSON.stringify(tags) : null, image_url || null, party || null, location || null, updated_at, leaderId];

        await safeQuery(query, values);

        // Clear related caches
        await redisClient.del(`leader:${leaderId}`);
        await redisClient.del('global:all_leaders');
        await redisClient.del('user:public:leaders');

        Logger.info(`Leader ${leaderId} updated and cache cleared`);
        
        res.status(200).json({ success: true, message: 'Leader updated successfully', leader_id: leaderId });
    } catch (error) {
        Logger.error('Error updating leader', { error: error.message });
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});



// ========== GET LEADERS BY PARTY ==========
const getLeadersByParty = asyncHandler(async (req, res) => {
    const { party } = req.params;
    if (!party) return res.status(400).json({ success: false, message: 'Party is required' });

    try {
        const cacheKey = `leaders:party:${party}`;
        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
            return res.status(200).json({ success: true, source: 'redis', ...JSON.parse(cachedData) });
        }

        const leaders = await safeQuery(`SELECT * FROM leaders WHERE party = ? ORDER BY created_at DESC`, [party]);

        if (leaders.length === 0) return res.status(404).json({ success: false, message: `No leaders for party: ${party}` });

        const transformedLeaders = leaders.map((leader, index) => transformLeaderData(leader, index));
        const responseData = { success: true, count: transformedLeaders.length, party, data: transformedLeaders };

        await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 300 });
        res.status(200).json({ success: true, source: 'database', ...responseData });
    } catch (error) {
        Logger.error('Error fetching leaders by party', { error: error.message });
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ========== SEARCH LEADERS ==========
const searchLeaders = asyncHandler(async (req, res) => {
    const { query } = req.query;
    if (!query || query.trim() === '') return res.status(400).json({ success: false, message: 'Search query is required' });

    try {
        const cacheKey = `leaders:search:${query}`;
        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
            return res.status(200).json({ success: true, source: 'redis', ...JSON.parse(cachedData) });
        }

        const searchQuery = `%${query}%`;
        const leaders = await safeQuery(
            `SELECT * FROM leaders WHERE name LIKE ? OR party LIKE ? OR location LIKE ? OR tags LIKE ? ORDER BY created_at DESC LIMIT 50`,
            [searchQuery, searchQuery, searchQuery, searchQuery]
        );

        const transformedLeaders = leaders.map((leader, index) => transformLeaderData(leader, index));
        const responseData = { success: true, count: transformedLeaders.length, query, data: transformedLeaders };

        await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 300 });
        res.status(200).json({ success: true, source: 'database', ...responseData });
    } catch (error) {
        Logger.error('Error searching leaders', { error: error.message });
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


module.exports = {
    createLeader,
    getAllLeaders,
    getLeaderById,
    editLeader,
    getLeadersByParty,
    searchLeaders,
 
    
    createLeaderPortfolio
};