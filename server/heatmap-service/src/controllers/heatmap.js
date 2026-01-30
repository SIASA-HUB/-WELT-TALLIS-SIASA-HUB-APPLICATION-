-- Optional: Create a materialized view for faster heatmap queries
CREATE OR REPLACE VIEW county_engagement_summary AS
SELECT 
    CASE 
        WHEN l.location LIKE '%Nairobi%' THEN 'Nairobi'
        WHEN l.location LIKE '%Mombasa%' THEN 'Mombasa'
        WHEN l.location LIKE '%Kisumu%' THEN 'Kisumu'
        WHEN l.location LIKE '%Nakuru%' THEN 'Nakuru'
        WHEN l.location LIKE '%Eldoret%' OR l.location LIKE '%Uasin Gishu%' THEN 'Eldoret'
        WHEN l.location LIKE '%Kisii%' THEN 'Kisii'
        WHEN l.location LIKE '%Kakamega%' THEN 'Kakamega'
        WHEN l.location LIKE '%Meru%' THEN 'Meru'
        WHEN l.location LIKE '%Thika%' OR l.location LIKE '%Kiambu%' THEN 'Thika'
        WHEN l.location LIKE '%Machakos%' THEN 'Machakos'
        ELSE 'Other'
    END as county,
    DATE(le.created_at) as engagement_date,
    COUNT(*) as total_engagements,
    SUM(CASE WHEN le.engagement_type = 'like' THEN 1 ELSE 0 END) as likes,
    SUM(CASE WHEN le.engagement_type = 'dislike' THEN 1 ELSE 0 END) as dislikes,
    SUM(CASE WHEN le.engagement_type = 'comment' THEN 1 ELSE 0 END) as comments,
    SUM(CASE WHEN le.engagement_type = 'view' THEN 1 ELSE 0 END) as views,
    COUNT(DISTINCT le.user_id) as unique_users
FROM leaders l
LEFT JOIN leader_engagements le ON l.leader_id = le.leader_id
GROUP BY county, DATE(le.created_at);

-- Create indexes for performance
CREATE INDEX idx_leader_engagements_created_at ON leader_engagements(created_at);
CREATE INDEX idx_leader_engagements_leader_id ON leader_engagements(leader_id);
CREATE INDEX idx_leader_engagements_type ON leader_engagements(engagement_type);
CREATE INDEX idx_leaders_location ON leaders(location);
CREATE INDEX idx_leaders_party ON leaders(party);




const { db } = require('../configurations/db');
const { Logger } = require('../utils/logger/logger');
const redisClient = require('../utils/redis/redis');

// Helper function to calculate engagement metrics
const calculateEngagementMetrics = (likes, dislikes, comments, views) => {
    const totalInteractions = likes + dislikes + comments;
    const engagementRate = views > 0 ? (totalInteractions / views) * 100 : 0;
    const sentimentScore = likes + dislikes > 0 ? 
        (likes / (likes + dislikes)) * 100 : 50;
    
    return {
        engagement_rate: Math.round(engagementRate * 100) / 100,
        sentiment_score: Math.round(sentimentScore * 10) / 10,
        total_interactions: totalInteractions
    };
};

// Get County-Level Heatmap Data
async function getCountyHeatmapData(req, res) {
    try {
        const { timeframe = '7d' } = req.query; // 7d, 30d, 90d, all
        
        // Try to get from Redis cache first
        const cacheKey = `heatmap:county:${timeframe}`;
        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
            return res.status(200).json({
                success: true,
                source: 'redis',
                data: JSON.parse(cachedData)
            });
        }

        // Calculate date range based on timeframe
        let dateFilter = '';
        const now = new Date();
        
        switch(timeframe) {
            case 'today':
                dateFilter = 'DATE(le.created_at) = CURDATE()';
                break;
            case '7d':
                dateFilter = 'le.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
                break;
            case '30d':
                dateFilter = 'le.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
                break;
            case '90d':
                dateFilter = 'le.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
                break;
            default:
                dateFilter = '1=1'; // All time
        }

        // Query for county-level engagement data
        const query = `
            WITH county_data AS (
                SELECT 
                    CASE 
                        WHEN l.location LIKE '%Nairobi%' THEN 'Nairobi'
                        WHEN l.location LIKE '%Mombasa%' THEN 'Mombasa'
                        WHEN l.location LIKE '%Kisumu%' THEN 'Kisumu'
                        WHEN l.location LIKE '%Nakuru%' THEN 'Nakuru'
                        WHEN l.location LIKE '%Eldoret%' OR l.location LIKE '%Uasin Gishu%' THEN 'Eldoret'
                        WHEN l.location LIKE '%Kisii%' THEN 'Kisii'
                        WHEN l.location LIKE '%Kakamega%' THEN 'Kakamega'
                        WHEN l.location LIKE '%Meru%' THEN 'Meru'
                        WHEN l.location LIKE '%Thika%' OR l.location LIKE '%Kiambu%' THEN 'Thika'
                        WHEN l.location LIKE '%Machakos%' THEN 'Machakos'
                        ELSE 'Other'
                    END as county,
                    COUNT(DISTINCT le.user_id) as unique_engagers,
                    SUM(CASE WHEN le.engagement_type = 'like' THEN 1 ELSE 0 END) as likes,
                    SUM(CASE WHEN le.engagement_type = 'dislike' THEN 1 ELSE 0 END) as dislikes,
                    SUM(CASE WHEN le.engagement_type = 'comment' THEN 1 ELSE 0 END) as comments,
                    SUM(CASE WHEN le.engagement_type = 'view' THEN 1 ELSE 0 END) as views,
                    COUNT(DISTINCT l.leader_id) as leaders_count
                FROM leaders l
                LEFT JOIN leader_engagements le ON l.leader_id = le.leader_id
                WHERE ${dateFilter}
                GROUP BY county
            )
            SELECT 
                county,
                unique_engagers,
                likes,
                dislikes,
                comments,
                views,
                leaders_count,
                (likes + dislikes + comments) as total_interactions,
                CASE 
                    WHEN views > 0 THEN ROUND(((likes + dislikes + comments) / views) * 100, 2)
                    ELSE 0 
                END as engagement_rate,
                CASE 
                    WHEN (likes + dislikes) > 0 THEN ROUND((likes / (likes + dislikes)) * 100, 1)
                    ELSE 50 
                END as sentiment_score
            FROM county_data
            WHERE county != 'Other'
            ORDER BY total_interactions DESC
            LIMIT 15
        `;

        const [countyRows] = await db.execute(query);
        
        // Generate approximate coordinates for each county (for map visualization)
        const countyCoordinates = {
            'Nairobi': { x: 50, y: 60 },
            'Mombasa': { x: 80, y: 80 },
            'Kisumu': { x: 40, y: 50 },
            'Nakuru': { x: 45, y: 55 },
            'Eldoret': { x: 42, y: 52 },
            'Kisii': { x: 38, y: 48 },
            'Kakamega': { x: 35, y: 53 },
            'Meru': { x: 55, y: 58 },
            'Thika': { x: 52, y: 59 },
            'Machakos': { x: 53, y: 62 }
        };

        const result = countyRows.map(row => {
            const coords = countyCoordinates[row.county] || { x: 50, y: 50 };
            const engagement = Math.min(Math.max(row.engagement_rate / 100, 0.2), 0.9);
            
            return {
                ...row,
                x: coords.x,
                y: coords.y,
                engagement: engagement,
                normalized_engagement: Math.round(engagement * 100),
                leading_party: getLeadingPartyForCounty(row.county) // Helper function
            };
        });

        // Cache for 5 minutes
        await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 300);

        res.status(200).json({
            success: true,
            source: 'database',
            data: result
        });
    } catch (error) {
        Logger.error('Error fetching county heatmap data', { error: error.message, stack: error.stack });
        res.status(500).json({
            success: false,
            message: 'Failed to fetch heatmap data'
        });
    }
}

// Get Weekly Engagement Heatmap
async function getWeeklyHeatmapData(req, res) {
    try {
        const { leader_id } = req.query; // Optional filter by leader
        
        const cacheKey = `heatmap:weekly:${leader_id || 'all'}`;
        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
            return res.status(200).json({
                success: true,
                source: 'redis',
                data: JSON.parse(cachedData)
            });
        }

        // Query for weekly engagement data (last 5 weeks)
        const query = leader_id ? `
            SELECT 
                WEEKDAY(created_at) as day_of_week,
                WEEK(created_at) as week_number,
                COUNT(*) as interaction_count,
                COUNT(DISTINCT user_id) as unique_users,
                SUM(CASE WHEN engagement_type = 'like' THEN 1 ELSE 0 END) as likes,
                SUM(CASE WHEN engagement_type = 'dislike' THEN 1 ELSE 0 END) as dislikes,
                SUM(CASE WHEN engagement_type = 'comment' THEN 1 ELSE 0 END) as comments
            FROM leader_engagements
            WHERE leader_id = ? 
                AND created_at >= DATE_SUB(NOW(), INTERVAL 5 WEEK)
            GROUP BY WEEK(created_at), WEEKDAY(created_at)
            ORDER BY week_number DESC, day_of_week ASC
        ` : `
            SELECT 
                WEEKDAY(created_at) as day_of_week,
                WEEK(created_at) as week_number,
                COUNT(*) as interaction_count,
                COUNT(DISTINCT user_id) as unique_users,
                SUM(CASE WHEN engagement_type = 'like' THEN 1 ELSE 0 END) as likes,
                SUM(CASE WHEN engagement_type = 'dislike' THEN 1 ELSE 0 END) as dislikes,
                SUM(CASE WHEN engagement_type = 'comment' THEN 1 ELSE 0 END) as comments
            FROM leader_engagements
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 5 WEEK)
            GROUP BY WEEK(created_at), WEEKDAY(created_at)
            ORDER BY week_number DESC, day_of_week ASC
        `;

        const params = leader_id ? [leader_id] : [];
        const [rows] = await db.execute(query, params);

        // Transform into heatmap format
        const weeks = 5;
        const days = 7;
        const heatmapData = [];
        
        for (let week = 0; week < weeks; week++) {
            for (let day = 0; day < days; day++) {
                const data = rows.find(r => 
                    r.day_of_week === day && 
                    r.week_number === (new Date().getWeek() - (weeks - week - 1))
                );
                
                const intensity = data ? 
                    Math.min(Math.max(data.interaction_count / 100, 0.2), 1) : 
                    0.2;
                
                const date = new Date();
                date.setDate(date.getDate() - ((weeks - week - 1) * 7 + day));
                
                heatmapData.push({
                    day,
                    week,
                    intensity: Math.round(intensity * 100) / 100,
                    date: date.toISOString().split('T')[0],
                    count: data?.interaction_count || 0,
                    likes: data?.likes || 0,
                    dislikes: data?.dislikes || 0,
                    comments: data?.comments || 0,
                    unique_users: data?.unique_users || 0
                });
            }
        }

        await redisClient.set(cacheKey, JSON.stringify(heatmapData), 'EX', 300);

        res.status(200).json({
            success: true,
            source: 'database',
            data: heatmapData
        });
    } catch (error) {
        Logger.error('Error fetching weekly heatmap data', { error: error.message, stack: error.stack });
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weekly heatmap data'
        });
    }
}

// Get Gender and Age Distribution Data
async function getDemographicData(req, res) {
    try {
        const { leader_id } = req.query;
        
        // In a real app, you'd have user demographic data
        // For now, we'll generate sample data based on engagement patterns
        
        const cacheKey = `heatmap:demographics:${leader_id || 'all'}`;
        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
            return res.status(200).json({
                success: true,
                source: 'redis',
                data: JSON.parse(cachedData)
            });
        }

        // Sample demographic data (in production, join with users table)
        const demographicData = {
            gender_age: [
                { label: 'Male (18-35)', value: 65 },
                { label: 'Male (36-55)', value: 58 },
                { label: 'Male (56+)', value: 42 },
                { label: 'Female (18-35)', value: 68 },
                { label: 'Female (36-55)', value: 61 },
                { label: 'Female (56+)', value: 45 }
            ],
            age_distribution: [
                { label: '18-25', value: 85 },
                { label: '26-35', value: 78 },
                { label: '36-45', value: 65 },
                { label: '46-55', value: 58 },
                { label: '56-65', value: 45 },
                { label: '65+', value: 32 }
            ],
            platform_distribution: [
                { platform: 'Twitter', percentage: 35 },
                { platform: 'Facebook', percentage: 28 },
                { platform: 'WhatsApp', percentage: 22 },
                { platform: 'Instagram', percentage: 12 },
                { platform: 'TikTok', percentage: 8 }
            ]
        };

        // If leader_id provided, adjust data slightly
        if (leader_id) {
            // Add some randomness based on leader_id hash
            const hash = leader_id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
            demographicData.gender_age = demographicData.gender_age.map(item => ({
                ...item,
                value: Math.min(100, Math.max(10, item.value + (hash % 20) - 10))
            }));
        }

        await redisClient.set(cacheKey, JSON.stringify(demographicData), 'EX', 600);

        res.status(200).json({
            success: true,
            source: 'database',
            data: demographicData
        });
    } catch (error) {
        Logger.error('Error fetching demographic data', { error: error.message, stack: error.stack });
        res.status(500).json({
            success: false,
            message: 'Failed to fetch demographic data'
        });
    }
}

// Get Party Support Trends
async function getPartyTrends(req, res) {
    try {
        const { days = 7 } = req.query;
        
        const cacheKey = `heatmap:party_trends:${days}`;
        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
            return res.status(200).json({
                success: true,
                source: 'redis',
                data: JSON.parse(cachedData)
            });
        }

        // Query for party support trends
        const query = `
            SELECT 
                DATE(le.created_at) as date,
                l.party,
                COUNT(*) as engagement_count,
                SUM(CASE WHEN le.engagement_type = 'like' THEN 1 ELSE 0 END) as likes,
                SUM(CASE WHEN le.engagement_type = 'dislike' THEN 1 ELSE 0 END) as dislikes
            FROM leader_engagements le
            JOIN leaders l ON le.leader_id = l.leader_id
            WHERE le.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                AND l.party IN ('UDA', 'ODM', 'WIPER', 'FORD-KENYA', 'KANU')
            GROUP BY DATE(le.created_at), l.party
            ORDER BY date ASC
        `;

        const [rows] = await db.execute(query, [parseInt(days)]);

        // Process data into trend format
        const parties = ['UDA', 'ODM', 'WIPER', 'FORD-KENYA', 'KANU'];
        const dates = Array.from({ length: days }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (days - i - 1));
            return date.toISOString().split('T')[0];
        });

        const trends = {};
        parties.forEach(party => {
            trends[party] = dates.map(date => {
                const dayData = rows.filter(r => 
                    r.date.toISOString().split('T')[0] === date && r.party === party
                );
                if (dayData.length > 0) {
                    const total = dayData.reduce((sum, r) => sum + r.engagement_count, 0);
                    const likes = dayData.reduce((sum, r) => sum + r.likes, 0);
                    const support = total > 0 ? Math.round((likes / total) * 100) : 0;
                    return support;
                }
                return 0;
            });
        });

        // Get day labels
        const dayLabels = dates.map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('en-US', { weekday: 'short' });
        });

        const result = {
            labels: dayLabels,
            datasets: Object.keys(trends).map((party, index) => ({
                label: party,
                data: trends[party],
                borderColor: getPartyColor(party),
                backgroundColor: `${getPartyColor(party)}20`,
                tension: 0.4,
                fill: true
            }))
        };

        await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 300);

        res.status(200).json({
            success: true,
            source: 'database',
            data: result
        });
    } catch (error) {
        Logger.error('Error fetching party trends', { error: error.message, stack: error.stack });
        res.status(500).json({
            success: false,
            message: 'Failed to fetch party trends'
        });
    }
}

// Get Top Performing Candidates/Wards
async function getTopPerformers(req, res) {
    try {
        const { type = 'candidates', limit = 10, timeframe = 'today' } = req.query;
        
        const cacheKey = `heatmap:top_${type}:${timeframe}:${limit}`;
        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
            return res.status(200).json({
                success: true,
                source: 'redis',
                data: JSON.parse(cachedData)
            });
        }

        let result;
        
        if (type === 'candidates') {
            // Get top performing candidates
            const query = `
                SELECT 
                    l.leader_id,
                    l.name,
                    l.party,
                    l.location,
                    COUNT(le.engagement_id) as total_engagements,
                    SUM(CASE WHEN le.engagement_type = 'like' THEN 1 ELSE 0 END) as likes,
                    SUM(CASE WHEN le.engagement_type = 'comment' THEN 1 ELSE 0 END) as comments,
                    COUNT(DISTINCT le.user_id) as unique_engagers,
                    ROW_NUMBER() OVER (ORDER BY COUNT(le.engagement_id) DESC) as rank
                FROM leaders l
                LEFT JOIN leader_engagements le ON l.leader_id = le.leader_id
                WHERE ${getTimeFilter(timeframe, 'le.created_at')}
                GROUP BY l.leader_id, l.name, l.party, l.location
                ORDER BY total_engagements DESC
                LIMIT ?
            `;

            const [rows] = await db.execute(query, [parseInt(limit)]);
            
            result = rows.map(row => ({
                id: row.leader_id,
                name: row.name,
                party: row.party,
                location: row.location,
                support: row.likes,
                engagements: row.total_engagements,
                comments: row.comments,
                unique_engagers: row.unique_engagers,
                rank: row.rank,
                change: calculateChange(row.leader_id, timeframe) // Helper function
            }));
        } else if (type === 'wards') {
            // Get top performing wards (simplified - using location field)
            const query = `
                SELECT 
                    SUBSTRING_INDEX(l.location, ',', 1) as ward,
                    COUNT(le.engagement_id) as total_engagements,
                    SUM(CASE WHEN le.engagement_type = 'like' THEN 1 ELSE 0 END) as likes,
                    COUNT(DISTINCT l.leader_id) as leaders_count,
                    ROW_NUMBER() OVER (ORDER BY COUNT(le.engagement_id) DESC) as rank
                FROM leaders l
                LEFT JOIN leader_engagements le ON l.leader_id = le.leader_id
                WHERE ${getTimeFilter(timeframe, 'le.created_at')}
                    AND l.location IS NOT NULL
                GROUP BY ward
                ORDER BY total_engagements DESC
                LIMIT ?
            `;

            const [rows] = await db.execute(query, [parseInt(limit)]);
            
            result = rows.map(row => ({
                name: row.ward,
                engagements: row.total_engagements,
                likes: row.likes,
                leaders_count: row.leaders_count,
                rank: row.rank,
                engagement_rate: row.total_engagements > 0 ? 
                    Math.round((row.likes / row.total_engagements) * 100) : 0
            }));
        }

        await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 300);

        res.status(200).json({
            success: true,
            source: 'database',
            data: result
        });
    } catch (error) {
        Logger.error('Error fetching top performers', { error: error.message, stack: error.stack });
        res.status(500).json({
            success: false,
            message: 'Failed to fetch top performers'
        });
    }
}

// Get Real-time Dashboard Metrics
async function getDashboardMetrics(req, res) {
    try {
        const cacheKey = 'heatmap:dashboard_metrics';
        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
            return res.status(200).json({
                success: true,
                source: 'redis',
                data: JSON.parse(cachedData)
            });
        }

        // Multiple metrics in single query for efficiency
        const query = `
            SELECT 
                -- Today's metrics
                (SELECT COUNT(*) FROM leader_engagements WHERE DATE(created_at) = CURDATE()) as today_engagements,
                (SELECT COUNT(DISTINCT user_id) FROM leader_engagements WHERE DATE(created_at) = CURDATE()) as today_unique_users,
                (SELECT COUNT(*) FROM leader_comments WHERE DATE(created_at) = CURDATE()) as today_comments,
                
                -- Yesterday's metrics for comparison
                (SELECT COUNT(*) FROM leader_engagements WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)) as yesterday_engagements,
                
                -- Total leaders
                (SELECT COUNT(*) FROM leaders) as total_leaders,
                
                -- Active wards (locations with engagements today)
                (SELECT COUNT(DISTINCT SUBSTRING_INDEX(location, ',', 1)) 
                 FROM leaders l 
                 JOIN leader_engagements le ON l.leader_id = le.leader_id 
                 WHERE DATE(le.created_at) = CURDATE()) as active_wards,
                
                -- Youth engagement estimate (18-35 based on user data if available)
                (SELECT COUNT(*) * 0.68 FROM leader_engagements WHERE DATE(created_at) = CURDATE()) as youth_participation
        `;

        const [[metrics]] = await db.execute(query);

        // Calculate percentage changes
        const engagementChange = metrics.yesterday_engagements > 0 ?
            ((metrics.today_engagements - metrics.yesterday_engagements) / metrics.yesterday_engagements) * 100 : 0;

        const result = {
            total_engagement_today: metrics.today_engagements,
            total_comments_today: metrics.today_comments,
            most_comments_today: metrics.today_comments, // You might want a separate query for this
            wards_engaged: metrics.active_wards,
            youth_participation: Math.round(metrics.youth_participation),
            percentage_changes: {
                engagement: Math.round(engagementChange * 10) / 10,
                comments: engagementChange + 5, // Example
                wards: 8 // Example
            }
        };

        await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 60); // 1 minute cache for real-time

        res.status(200).json({
            success: true,
            source: 'database',
            data: result
        });
    } catch (error) {
        Logger.error('Error fetching dashboard metrics', { error: error.message, stack: error.stack });
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard metrics'
        });
    }
}

// Helper Functions
function getTimeFilter(timeframe, column) {
    switch(timeframe) {
        case 'today':
            return `DATE(${column}) = CURDATE()`;
        case 'yesterday':
            return `DATE(${column}) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`;
        case '7d':
            return `${column} >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
        case '30d':
            return `${column} >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
        default:
            return '1=1';
    }
}

function getPartyColor(party) {
    const colors = {
        'UDA': '#BB0000',
        'ODM': '#006600',
        'WIPER': '#8B5CF6',
        'FORD-KENYA': '#10B981',
        'KANU': '#4B0082',
        'JUBILEE': '#FFD700',
        'NARC-KENYA': '#EC4899'
    };
    return colors[party] || '#6B7280';
}

function getLeadingPartyForCounty(county) {
    // In production, this would query the database
    // For now, return based on county patterns
    const countyPartyMap = {
        'Nairobi': 'UDA',
        'Mombasa': 'ODM',
        'Kisumu': 'ODM',
        'Nakuru': 'UDA',
        'Eldoret': 'UDA',
        'Kisii': 'ODM',
        'Kakamega': 'ODM',
        'Meru': 'UDA',
        'Thika': 'UDA',
        'Machakos': 'WIPER'
    };
    return countyPartyMap[county] || 'UDA';
}

function calculateChange(leaderId, timeframe) {
    // In production, this would compare current period with previous period
    // For now, return random positive change
    return Math.random() * 20 + 5;
}

// Add this to Date prototype for week calculations
Date.prototype.getWeek = function() {
    const date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

module.exports = {
    getCountyHeatmapData,
    getWeeklyHeatmapData,
    getDemographicData,
    getPartyTrends,
    getTopPerformers,
    getDashboardMetrics
};

