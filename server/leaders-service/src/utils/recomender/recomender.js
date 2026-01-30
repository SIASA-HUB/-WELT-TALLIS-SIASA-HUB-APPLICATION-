const Logger = require('../logger/logger');
const redis = require('../redis/redis');
const { safeQuery } = require('../../configurations/db');

/**
 * Recommend leaders for a user
 */
async function recommendLeaders(user, limit = 5) {
    const userCacheKey = `user:${user.id}:leaders`;
    const globalLeadersKey = 'global:all_leaders';

    try {
        // 1. Check if user-specific recommendations are cached
        const cachedUserRecs = await redis.get(userCacheKey);
        if (cachedUserRecs) return JSON.parse(cachedUserRecs);

        // 2. Fetch all leaders from cache or DB - UPDATED QUERY
        let allLeaders;
        const cachedGlobal = await redis.get(globalLeadersKey);

        if (cachedGlobal) {
            allLeaders = JSON.parse(cachedGlobal);
        } else {
            // Updated query to match new database schema
            allLeaders = await safeQuery(`
                SELECT 
                    leader_id AS id,
                    name,
                    party,
                    location AS county,
                    tags,
                    image_url,
                    likes,
                    dislikes,
                    views,
                    comments_count AS comments,
                    position,
                    verification,
                    education
                FROM leaders
                WHERE status = 'active'
            `);

            await redis.set(globalLeadersKey, JSON.stringify(allLeaders), 'EX', 3600);
        }

        if (!allLeaders || allLeaders.length === 0) return [];

        // 3. Calculate scores for recommendations
        const scored = allLeaders.map((leader, index) => {
            let score = 1.0; // Base score

            // Matching party/location boosts score
            if (leader.party === user.party) score += 0.5;
            if (leader.county === user.location) score += 0.3;

            // Matching tags/interests
            let leaderTags = [];
            try {
                leaderTags = typeof leader.tags === 'string' ? JSON.parse(leader.tags) : (leader.tags || []);
            } catch (e) {
                leaderTags = [];
            }

            const userInterests = user.interests || [];
            if (leaderTags.length && userInterests.length) {
                const common = leaderTags.filter(tag => userInterests.includes(tag));
                score += (common.length / userInterests.length) * 0.4;
            }

            // Calculate approval rating from likes/dislikes
            const totalVotes = (leader.likes || 0) + (leader.dislikes || 0);
            const approval_rating = totalVotes > 0 
                ? Math.round(((leader.likes || 0) / totalVotes) * 100)
                : Math.floor(Math.random() * 30) + 50;

            // Calculate engagements
            const engagements = (leader.views || 0) + (leader.comments || 0);

            // Calculate followers (simulated)
            const followers = Math.floor(approval_rating * 1000 + (leader.likes || 0) * 10);

            // Popularity boost
            score += (leader.likes || 0) / 1000;
            score += (leader.views || 0) / 5000;

            // Verification boost
            if (leader.verification === 1) score += 0.3;

            // Randomness to shuffle results slightly
            const randomness = Math.random() * 0.5;
            
            return { 
                ...leader, 
                approval_rating,
                followers,
                engagements,
                finalScore: score + randomness 
            };
        });

        // 4. Sort by score and apply limit
        const sorted = scored.sort((a, b) => b.finalScore - a.finalScore);
        const result = limit ? sorted.slice(0, limit) : sorted;

        // 5. Ensure all required fields exist and add defaults
        const transformed = result.map((leader, index) => ({
            id: leader.id || `leader-${index}`,
            name: leader.name || 'Unknown Leader',
            party: leader.party || 'INDEPENDENT',
            position: leader.position || 'Political Leader',
            county: leader.county || 'Kenya',
            image_url: leader.image_url || '',
            approval_rating: leader.approval_rating || 50,
            followers: leader.followers || 10000,
            engagements: leader.engagements || 100,
            finalScore: leader.finalScore || 0,
            likes: leader.likes || 0,
            dislikes: leader.dislikes || 0,
            views: leader.views || 0,
            comments: leader.comments || 0,
            verified: leader.verification === 1,
            education: leader.education || 'Not specified'
        }));

        // 6. Cache user-specific recommendations for 5 minutes
        if (transformed.length > 0) {
            await redis.set(userCacheKey, JSON.stringify(transformed), 'EX', 300);
        }

        return transformed;

    } catch (error) {
        Logger.error('Recommendation Engine Error', { error: error.message, userId: user.id });
        return [];
    }
}

module.exports = { recommendLeaders };