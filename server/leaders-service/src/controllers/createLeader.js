const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const { recommendLeaders } = require('../utils/recomender/recomender');
const Logger = require('../utils/logger/logger');
const { safeQuery, safeQueryOne } = require('../configurations/db');
const { getKenyaTimeISO } = require('../utils/timestamps/timeStamp');
const redisClient = require('../utils/redis/redis');

// Helper function to parse tags from string
const parseTags = (tagsString) => {
    if (!tagsString) return [];
    
    try {
        // Try to parse the JSON string
        const parsed = JSON.parse(tagsString);
        
        // Handle different formats from your API data
        if (Array.isArray(parsed)) {
            return parsed.filter(tag => typeof tag === 'string');
        } else if (typeof parsed === 'object') {
            // Extract all string values from the object
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
    
    const locationLower = locationStr.toLowerCase();
    
    for (const mapping of countyMappings) {
        for (const keyword of mapping.keywords) {
            if (locationLower.includes(keyword)) {
                return mapping.county;
            }
        }
    }
    
    return 'Kenya';
};

// Helper function to generate dynamic metrics based on finalScore
const generateMetrics = (finalScore) => {
    const baseScore = finalScore || 1;
    const baseApproval = Math.min(Math.max(Math.round(baseScore * 45), 30), 85);
    const baseLikes = Math.round(baseScore * 5000);
    
    return {
        approval: baseApproval,
        likes: baseLikes,
        dislikes: Math.round(baseLikes * 0.2),
        views: Math.round(baseLikes * 5),
        manifestoApprovals: Math.round(baseLikes * 0.4),
        comments: Math.round(baseLikes * 0.02),
        supportMap: {
            'Constituency': baseApproval,
            'County': Math.round(baseApproval * 0.8),
            'Region': Math.round(baseApproval * 0.6),
            'National': Math.round(baseApproval * 0.5)
        }
    };
};

// Helper function to generate sample track record
const generateTrackRecord = () => {
    return [
        {
            id: 1,
            title: "Community Development",
            desc: "Active in constituency development projects",
            user: "Community Watch",
            verified: true
        },
        {
            id: 2,
            title: "Legislative Work",
            desc: "Participated in parliamentary proceedings",
            user: "Legislative Monitor",
            verified: true
        }
    ];
};

// Helper function to generate sample voting record
const generateVotingRecord = () => {
    return [
        {
            bill: "National Development Bill",
            vote: "Yes",
            result: "Passed",
            date: "2023-03-15"
        },
        {
            bill: "County Allocation Bill",
            vote: "Yes",
            result: "Passed",
            date: "2023-04-22"
        }
    ];
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

        // Format tags as JSON string
        const formattedTags = tags ? JSON.stringify(tags) : JSON.stringify([]);

        // Handle uploaded images
        if (req.body.images && req.body.images.length > 0) {
            optionalData.image_url = req.body.images[0].url; 
        }
        delete optionalData.images;

        // Build columns and values
        const columns = ['leader_id', 'name', 'tags', 'created_at', 'updated_at', ...Object.keys(optionalData)];
        const placeholders = columns.map(() => '?').join(', ');
        const values = [leaderId, name.trim(), formattedTags, created_at, updated_at, ...Object.values(optionalData)];

        // Insert into MariaDB using safeQuery
        await safeQuery(`INSERT INTO leaders (${columns.join(', ')}) VALUES (${placeholders})`, values);

        // Construct leader object
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
        await redisClient.set(globalLeadersKey, JSON.stringify(leadersList), 'EX', 3600);

        // Update public feed cache
        const userCacheKey = 'user:public:leaders';
        const publicFeed = await redisClient.get(userCacheKey);
        let publicLeaders = publicFeed ? JSON.parse(publicFeed) : [];
        publicLeaders.unshift(leaderObj);
        await redisClient.set(userCacheKey, JSON.stringify(publicLeaders), 'EX', 120);

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
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});





const transformLeaderData = (leader, index) => {
    // Calculate approval rating from likes/dislikes
    const totalVotes = (leader.likes || 0) + (leader.dislikes || 0);
    const approval = totalVotes > 0 
        ? Math.round(((leader.likes || 0) / totalVotes) * 100)
        : Math.floor(Math.random() * 30) + 50;

    // Calculate engagements
    const engagements = (leader.views || 0) + (leader.comments_count || 0);

    // Calculate followers (simulated based on popularity)
    const followers = Math.floor(approval * 1000 + (leader.likes || 0) * 10);

    return {
        id: leader.leader_id || `leader-${index}`,
        name: leader.name || 'Unknown Leader',
        party: leader.party || 'INDEPENDENT',
        position: leader.position || 'Political Leader',
        county: leader.location || 'Kenya',
        image_url: leader.image_url || '', // USE DATABASE IMAGE ONLY
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

// ========== GET ALL LEADERS ==========
const getAllLeaders = asyncHandler(async (req, res) => {
    try {
        const leaders = await safeQuery(`
            SELECT 
                leader_id,
                name,
                party,
                location,
                position,
                likes,
                dislikes,
                views,
                comments_count,
                image_url,
                verification,
                education
            FROM leaders
            WHERE status = 'active'
            LIMIT 50
        `);

        // Transform leaders using database images only
        const transformedLeaders = leaders.map((leader, index) => transformLeaderData(leader, index));

        // Get filter options
        const uniqueParties = [...new Set(transformedLeaders.map(l => l.party).filter(Boolean))].sort();
        const uniqueCounties = [...new Set(transformedLeaders.map(l => l.county).filter(Boolean))].sort();
        const uniquePositions = [...new Set(transformedLeaders.map(l => l.position).filter(Boolean))].sort();

        res.status(200).json({
            success: true,
            count: transformedLeaders.length,
            data: transformedLeaders,
            filter_options: {
                parties: ['All', ...uniqueParties],
                counties: ['All', ...uniqueCounties],
                positions: ['All', ...uniquePositions]
            }
        });

    } catch (error) {
        Logger.error('Error in getAllLeaders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leaders'
        });
    }
});










// ========== GET SINGLE LEADER BY ID ==========
const getLeaderById = asyncHandler(async (req, res) => {
    const { leaderId } = req.params;

    try {
        // Try to get from Redis cache first
        const cacheKey = `leader:${leaderId}`;
        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
            return res.status(200).json({
                success: true,
                source: 'redis',
                data: JSON.parse(cachedData)
            });
        }

        // Get leader data using safeQueryOne
        const leader = await safeQueryOne(
            `SELECT leader_id, name, party, location, tags, image_url, created_at, updated_at, finalScore, Location 
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

        // Get engagement metrics using safeQuery
        const engagementQuery = `
            SELECT 
                SUM(CASE WHEN engagement_type = 'like' THEN 1 ELSE 0 END) as like_count,
                SUM(CASE WHEN engagement_type = 'dislike' THEN 1 ELSE 0 END) as dislike_count,
                SUM(CASE WHEN engagement_type = 'comment' THEN 1 ELSE 0 END) as comment_count,
                SUM(CASE WHEN engagement_type = 'view' THEN 1 ELSE 0 END) as view_count
            FROM leader_engagements 
            WHERE leader_id = ?
        `;
        
        const engagementResult = await safeQueryOne(engagementQuery, [leaderId]);
        
        // Get manifesto approvals
        const manifestoResult = await safeQueryOne(
            'SELECT COUNT(*) as manifesto_approval_count FROM manifesto_approvals WHERE leader_id = ?',
            [leaderId]
        );
        
        // Get recent comments
        const commentsQuery = `
            SELECT c.comment_id, c.user_id, c.comment, c.created_at, u.username
            FROM leader_comments c
            LEFT JOIN users u ON c.user_id = u.user_id
            WHERE c.leader_id = ?
            ORDER BY c.created_at DESC
            LIMIT 5
        `;
        
        const commentsResult = await safeQuery(commentsQuery, [leaderId]);
        
        // Combine data
        const leaderWithEngagements = {
            ...leader,
            like_count: engagementResult?.like_count || 0,
            dislike_count: engagementResult?.dislike_count || 0,
            comment_count: engagementResult?.comment_count || 0,
            view_count: engagementResult?.view_count || 0,
            manifesto_approval_count: manifestoResult?.manifesto_approval_count || 0,
            recent_comments: commentsResult || []
        };

        // Transform the data
        const transformedLeader = transformLeaderData(leaderWithEngagements);
        
        // Add engagement metrics
        transformedLeader.engagement_metrics = {
            like_count: leaderWithEngagements.like_count,
            dislike_count: leaderWithEngagements.dislike_count,
            comment_count: leaderWithEngagements.comment_count,
            view_count: leaderWithEngagements.view_count,
            manifesto_approval_count: leaderWithEngagements.manifesto_approval_count
        };
        
        transformedLeader.recent_comments = leaderWithEngagements.recent_comments.map(comment => ({
            comment_id: comment.comment_id,
            user_id: comment.user_id,
            comment: comment.comment,
            created_at: comment.created_at,
            username: comment.username || 'Anonymous'
        }));

        // Cache for 10 minutes
        await redisClient.set(cacheKey, JSON.stringify(transformedLeader), 'EX', 600);

        res.status(200).json({
            success: true,
            source: 'database',
            data: transformedLeader
        });
    } catch (error) {
        Logger.error('Error fetching leader by ID', { error: error.message, stack: error.stack });
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ========== EDIT LEADER ==========
const editLeader = asyncHandler(async (req, res) => {
    const { leaderId } = req.params;
    const { name, tags, image_url, party, location } = req.body;

    if (!leaderId) {
        return res.status(400).json({ 
            success: false,
            message: 'Leader ID is required' 
        });
    }

    try {
        const updated_at = getKenyaTimeISO();
        
        // Build update query using safeQuery
        const query = `
            UPDATE leaders 
            SET name = COALESCE(?, name), 
                tags = COALESCE(?, tags), 
                image_url = COALESCE(?, image_url),
                party = COALESCE(?, party),
                location = COALESCE(?, location),
                updated_at = ? 
            WHERE leader_id = ?`;

        const values = [
            name || null, 
            tags ? JSON.stringify(tags) : null, 
            image_url || null, 
            party || null,
            location || null,
            updated_at, 
            leaderId
        ];

        await safeQuery(query, values);

        // Clear cache for this leader
        await redisClient.del(`leader:${leaderId}`);
        
        // Clear global leaders cache
        await redisClient.del('global:all_leaders');
        await redisClient.del('user:public:leaders');

        Logger.info(`Leader ${leaderId} updated successfully`);
        
        res.status(200).json({ 
            success: true,
            message: 'Leader updated successfully',
            leader_id: leaderId,
            updated_at: updated_at
        });
    } catch (error) {
        Logger.error('Error updating leader', { error: error.message, stack: error.stack });
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ========== GET LEADERS BY PARTY ==========
const getLeadersByParty = asyncHandler(async (req, res) => {
    const { party } = req.params;
    
    if (!party) {
        return res.status(400).json({
            success: false,
            message: 'Party parameter is required'
        });
    }

    try {
        // Try to get from Redis cache first
        const cacheKey = `leaders:party:${party}`;
        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
            return res.status(200).json({
                success: true,
                source: 'redis',
                ...JSON.parse(cachedData)
            });
        }

        // Get leaders by party using safeQuery
        const leaders = await safeQuery(
            `SELECT * FROM leaders WHERE party = ? ORDER BY created_at DESC`,
            [party]
        );

        if (leaders.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No leaders found for party: ${party}`
            });
        }

        // Transform the data
        const transformedLeaders = leaders.map((leader, index) => transformLeaderData(leader, index));

        const responseData = {
            success: true,
            count: transformedLeaders.length,
            party: party,
            data: transformedLeaders
        };

        // Cache for 5 minutes
        await redisClient.set(cacheKey, JSON.stringify(responseData), 'EX', 300);

        res.status(200).json({
            success: true,
            source: 'database',
            ...responseData
        });
    } catch (error) {
        Logger.error('Error fetching leaders by party', { error: error.message, stack: error.stack });
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ========== SEARCH LEADERS ==========
const searchLeaders = asyncHandler(async (req, res) => {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Search query is required'
        });
    }

    try {
        // Try to get from Redis cache first
        const cacheKey = `leaders:search:${query}`;
        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
            return res.status(200).json({
                success: true,
                source: 'redis',
                ...JSON.parse(cachedData)
            });
        }

        const searchQuery = `%${query}%`;
        
        // Search leaders using safeQuery
        const leaders = await safeQuery(
            `SELECT * FROM leaders 
             WHERE name LIKE ? 
                OR party LIKE ? 
                OR location LIKE ? 
                OR tags LIKE ?
             ORDER BY created_at DESC
             LIMIT 50`,
            [searchQuery, searchQuery, searchQuery, searchQuery]
        );

        if (leaders.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                message: 'No leaders found matching your search',
                data: []
            });
        }

        // Transform the data
        const transformedLeaders = leaders.map((leader, index) => transformLeaderData(leader, index));

        const responseData = {
            success: true,
            count: transformedLeaders.length,
            query: query,
            data: transformedLeaders
        };

        // Cache for 5 minutes
        await redisClient.set(cacheKey, JSON.stringify(responseData), 'EX', 300);

        res.status(200).json({
            success: true,
            source: 'database',
            ...responseData
        });
    } catch (error) {
        Logger.error('Error searching leaders', { error: error.message, stack: error.stack });
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ========== GET FILTER OPTIONS ==========
const getFilterOptions = asyncHandler(async (req, res) => {
    try {
        // Try to get from Redis cache first
        const cacheKey = 'leaders:filter_options';
        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
            return res.status(200).json({
                success: true,
                source: 'redis',
                data: JSON.parse(cachedData)
            });
        }

        // Get unique parties
        const partiesResult = await safeQuery(
            'SELECT DISTINCT party FROM leaders WHERE party IS NOT NULL ORDER BY party'
        );
        const parties = partiesResult.map(row => row.party).filter(Boolean);

        // Get unique locations
        const locationsResult = await safeQuery(
            'SELECT DISTINCT COALESCE(Location, location) as location FROM leaders WHERE location IS NOT NULL OR Location IS NOT NULL'
        );
        
        // Extract counties from locations
        const countiesSet = new Set();
        locationsResult.forEach(row => {
            const county = extractCounty(row.location);
            if (county !== 'Kenya') {
                countiesSet.add(county);
            }
        });
        const counties = Array.from(countiesSet).sort();

        // Default positions
        const positions = ['All', 'Leader', 'MP', 'Senator', 'Governor', 'MCA', 'President', 'Deputy President', 'EALA Member'];

        const filterOptions = {
            parties: ['All', ...parties],
            counties: ['All', ...counties],
            positions: positions
        };

        // Cache for 1 hour
        await redisClient.set(cacheKey, JSON.stringify(filterOptions), 'EX', 3600);

        res.status(200).json({
            success: true,
            source: 'database',
            data: filterOptions
        });
    } catch (error) {
        Logger.error('Error fetching filter options', { error: error.message, stack: error.stack });
        res.status(500).json({
            success: false,
            message: 'Failed to fetch filter options',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = {
    createLeader,
    getAllLeaders,        // Uses recommendLeaders algorithm
    getLeaderById,
    editLeader,
    getLeadersByParty,
    searchLeaders,
    getFilterOptions
};