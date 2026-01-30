import { Request, Response } from 'express';
import pool from '../config/database';

class AdminController {
  // Get dashboard summary statistics
  async getDashboardSummary(req: Request, res: Response) {
    try {
      // Get total users count
      const [[{ totalUsers }]] = await pool.execute(
        'SELECT COUNT(*) as totalUsers FROM users'
      ) as any;

      // Get total leaders count
      const [[{ totalLeaders }]] = await pool.execute(
        'SELECT COUNT(*) as totalLeaders FROM leaders'
      ) as any;

      // Get total manifestos count
      const [[{ totalManifestos }]] = await pool.execute(
        'SELECT COUNT(*) as totalManifestos FROM manifestos'
      ) as any;

      // Get total reactions count
      const [[{ totalReactions }]] = await pool.execute(
        'SELECT COUNT(*) as totalReactions FROM manifesto_engagement'
      ) as any;

      // Get total comments count
      const [[{ totalComments }]] = await pool.execute(
        'SELECT COUNT(*) as totalComments FROM manifesto_engagement WHERE type = "comment"'
      ) as any;

      // Get today's statistics
      const today = new Date().toISOString().split('T')[0];
      const [[{ todayUsers }]] = await pool.execute(
        'SELECT COUNT(*) as todayUsers FROM users WHERE DATE(created_at) = ?',
        [today]
      ) as any;

      const [[{ todayManifestos }]] = await pool.execute(
        'SELECT COUNT(*) as todayManifestos FROM manifestos WHERE DATE(created_at) = ?',
        [today]
      ) as any;

      const [[{ todayComments }]] = await pool.execute(
        'SELECT COUNT(*) as todayComments FROM manifesto_engagement WHERE DATE(created_at) = ? AND type = "comment"',
        [today]
      ) as any;

      // Get user gender statistics
      const [genderStats] = await pool.execute(`
        SELECT 
          COALESCE(gender, 'Not Specified') as gender,
          COUNT(*) as count
        FROM users
        GROUP BY gender
      `);

      // Get user age bracket statistics
      const [ageStats] = await pool.execute(`
        SELECT 
          COALESCE(age_bracket, 'Not Specified') as age_bracket,
          COUNT(*) as count
        FROM users
        GROUP BY age_bracket
        ORDER BY 
          CASE age_bracket
            WHEN '18-24' THEN 1
            WHEN '25-34' THEN 2
            WHEN '35-44' THEN 3
            WHEN '45-54' THEN 4
            WHEN '55+' THEN 5
            ELSE 6
          END
      `);

      // Get user county statistics
      const [countyStats] = await pool.execute(`
        SELECT 
          COALESCE(county, 'Not Specified') as county,
          COUNT(*) as count
        FROM users
        GROUP BY county
        ORDER BY count DESC
        LIMIT 10
      `);

      // Get user verification statistics
      const [[{ verifiedUsers }]] = await pool.execute(
        'SELECT COUNT(*) as verifiedUsers FROM users WHERE is_verified = 1'
      ) as any;

      const [[{ unverifiedUsers }]] = await pool.execute(
        'SELECT COUNT(*) as unverifiedUsers FROM users WHERE is_verified = 0'
      ) as any;

      // Get leader party statistics
      const [partyStats] = await pool.execute(`
        SELECT 
          COALESCE(party, 'Independent') as party,
          COUNT(*) as count
        FROM leaders
        GROUP BY party
        ORDER BY count DESC
      `);

      // Get leader position statistics
      const [positionStats] = await pool.execute(`
        SELECT 
          COALESCE(position, 'Not Specified') as position,
          COUNT(*) as count
        FROM leaders
        GROUP BY position
        ORDER BY count DESC
      `);

      // Get engagement trends (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [engagementTrends] = await pool.execute(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as total_engagements,
          SUM(CASE WHEN type = 'like' THEN 1 ELSE 0 END) as likes,
          SUM(CASE WHEN type = 'dislike' THEN 1 ELSE 0 END) as dislikes,
          SUM(CASE WHEN type = 'comment' THEN 1 ELSE 0 END) as comments
        FROM manifesto_engagement
        WHERE created_at >= ?
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `, [thirtyDaysAgo]);

      // Get top 10 most engaged manifestos
      const [topManifestos] = await pool.execute(`
        SELECT 
          m.manifesto_id,
          m.main_agenda,
          l.name as leader_name,
          l.party,
          COUNT(e.engagement_id) as total_engagements,
          SUM(CASE WHEN e.type = 'like' THEN 1 ELSE 0 END) as likes,
          SUM(CASE WHEN e.type = 'dislike' THEN 1 ELSE 0 END) as dislikes,
          SUM(CASE WHEN e.type = 'comment' THEN 1 ELSE 0 END) as comments
        FROM manifestos m
        LEFT JOIN leaders l ON m.leader_id = l.leader_id
        LEFT JOIN manifesto_engagement e ON m.manifesto_id = e.manifesto_id
        GROUP BY m.manifesto_id
        ORDER BY total_engagements DESC
        LIMIT 10
      `);

      // Get recent activities
      const [recentActivities] = await pool.execute(`
        (SELECT 
          'user_signup' as type,
          user_id as identifier,
          anonymous_username as name,
          created_at,
          'User signed up' as description
        FROM users
        ORDER BY created_at DESC
        LIMIT 5)
        
        UNION ALL
        
        (SELECT 
          'manifesto_created' as type,
          leader_id as identifier,
          main_agenda as name,
          created_at,
          'Manifesto created' as description
        FROM manifestos
        ORDER BY created_at DESC
        LIMIT 5)
        
        UNION ALL
        
        (SELECT 
          'comment_added' as type,
          user_id as identifier,
          SUBSTRING(comment, 1, 50) as name,
          created_at,
          'Comment added' as description
        FROM manifesto_engagement
        WHERE type = 'comment'
        ORDER BY created_at DESC
        LIMIT 5)
        
        ORDER BY created_at DESC
        LIMIT 10
      `);

      res.json({
        success: true,
        data: {
          summary: {
            totalUsers,
            totalLeaders,
            totalManifestos,
            totalReactions,
            totalComments,
            todayUsers,
            todayManifestos,
            todayComments,
            verifiedUsers,
            unverifiedUsers
          },
          userDemographics: {
            gender: genderStats,
            age: ageStats,
            county: countyStats,
            verification: {
              verified: verifiedUsers,
              unverified: unverifiedUsers
            }
          },
          leaderStatistics: {
            parties: partyStats,
            positions: positionStats
          },
          engagementTrends,
          topManifestos,
          recentActivities
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard data'
      });
    }
  }

  // Get all users with pagination and filters
  async getAllUsers(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        gender = '',
        age_bracket = '',
        county = '',
        is_verified = '',
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      let query = `
        SELECT 
          id,
          user_id,
          anonymous_username,
          gender,
          age_bracket,
          county,
          ward,
          voter_card,
          will_vote,
          is_verified,
          created_at,
          updated_at
        FROM users
        WHERE 1=1
      `;

      const params: any[] = [];

      if (search) {
        query += ` AND (
          anonymous_username LIKE ? OR 
          user_id LIKE ? OR
          county LIKE ? OR
          ward LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (gender) {
        query += ` AND gender = ?`;
        params.push(gender);
      }

      if (age_bracket) {
        query += ` AND age_bracket = ?`;
        params.push(age_bracket);
      }

      if (county) {
        query += ` AND county = ?`;
        params.push(county);
      }

      if (is_verified !== '') {
        query += ` AND is_verified = ?`;
        params.push(is_verified === 'true' ? 1 : 0);
      }

      // Add sorting
      const validSortColumns = ['created_at', 'updated_at', 'anonymous_username'];
      const sortColumn = validSortColumns.includes(sortBy as string) ? sortBy : 'created_at';
      const sortDirection = sortOrder === 'ASC' ? 'ASC' : 'DESC';
      query += ` ORDER BY ${sortColumn} ${sortDirection}`;

      // Add pagination
      query += ` LIMIT ? OFFSET ?`;
      params.push(Number(limit), offset);

      const [users] = await pool.execute(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
      const countParams = params.slice(0, -2); // Remove limit and offset

      const [[{ total }]] = await pool.execute(countQuery, countParams) as any;

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }

  // Update user verification status
  async updateUserVerification(req: Request, res: Response) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const { userId } = req.params;
      const { is_verified } = req.body;

      await connection.execute(
        'UPDATE users SET is_verified = ?, updated_at = NOW() WHERE user_id = ?',
        [is_verified ? 1 : 0, userId]
      );

      await connection.commit();

      res.json({
        success: true,
        message: 'User verification status updated successfully'
      });
    } catch (error) {
      await connection.rollback();
      console.error('Error updating user verification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user verification'
      });
    } finally {
      connection.release();
    }
  }

  // Get all leaders with pagination and filters
  async getAllLeaders(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        party = '',
        location = '',
        status = '',
        verification = '',
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      let query = `
        SELECT 
          id,
          leader_id,
          name,
          party,
          location,
          tags,
          status,
          image_url,
          position,
          verification,
          likes,
          dislikes,
          views,
          manifesto_approvals,
          comments_count,
          education,
          created_at,
          updated_at
        FROM leaders
        WHERE 1=1
      `;

      const params: any[] = [];

      if (search) {
        query += ` AND (
          name LIKE ? OR 
          leader_id LIKE ? OR
          party LIKE ? OR
          location LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (party) {
        query += ` AND party = ?`;
        params.push(party);
      }

      if (location) {
        query += ` AND location = ?`;
        params.push(location);
      }

      if (status) {
        query += ` AND status = ?`;
        params.push(status);
      }

      if (verification !== '') {
        query += ` AND verification = ?`;
        params.push(verification === 'true' ? 1 : 0);
      }

      // Add sorting
      const validSortColumns = ['created_at', 'updated_at', 'name', 'likes', 'dislikes', 'views'];
      const sortColumn = validSortColumns.includes(sortBy as string) ? sortBy : 'created_at';
      const sortDirection = sortOrder === 'ASC' ? 'ASC' : 'DESC';
      query += ` ORDER BY ${sortColumn} ${sortDirection}`;

      // Add pagination
      query += ` LIMIT ? OFFSET ?`;
      params.push(Number(limit), offset);

      const [leaders] = await pool.execute(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) as total FROM leaders WHERE 1=1';
      const countParams = params.slice(0, -2);

      const [[{ total }]] = await pool.execute(countQuery, countParams) as any;

      res.json({
        success: true,
        data: {
          leaders,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error fetching leaders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch leaders'
      });
    }
  }

  // Create new leader
  async createLeader(req: Request, res: Response) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const {
        leader_id,
        name,
        party,
        location,
        tags,
        image_url,
        position,
        education
      } = req.body;

      // Generate unique leader ID if not provided
      const finalLeaderId = leader_id || `leader_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await connection.execute(
        `INSERT INTO leaders (
          leader_id, name, party, location, tags, 
          status, image_url, position, verification, 
          education, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          finalLeaderId,
          name,
          party,
          location,
          JSON.stringify(tags || []),
          'active',
          image_url || null,
          position || null,
          1, // Default verification true for admin-created leaders
          education || null
        ]
      );

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Leader created successfully',
        leader_id: finalLeaderId
      });
    } catch (error) {
      await connection.rollback();
      console.error('Error creating leader:', error);
      
      // Check for duplicate entry
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Leader ID already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create leader'
      });
    } finally {
      connection.release();
    }
  }

  // Update leader
  async updateLeader(req: Request, res: Response) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const { leaderId } = req.params;
      const updateData = req.body;

      // Build dynamic update query
      const updates: string[] = [];
      const values: any[] = [];

      // Allowed fields to update
      const allowedFields = [
        'name', 'party', 'location', 'tags', 'status', 
        'image_url', 'position', 'verification', 'education'
      ];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          updates.push(`${key} = ?`);
          
          // Special handling for tags (JSON stringify)
          if (key === 'tags' && Array.isArray(updateData[key])) {
            values.push(JSON.stringify(updateData[key]));
          } else {
            values.push(updateData[key]);
          }
        }
      });

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
      }

      updates.push('updated_at = NOW()');

      const query = `UPDATE leaders SET ${updates.join(', ')} WHERE leader_id = ?`;
      values.push(leaderId);

      await connection.execute(query, values);

      await connection.commit();

      res.json({
        success: true,
        message: 'Leader updated successfully'
      });
    } catch (error) {
      await connection.rollback();
      console.error('Error updating leader:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update leader'
      });
    } finally {
      connection.release();
    }
  }

  // Delete leader
  async deleteLeader(req: Request, res: Response) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const { leaderId } = req.params;

      // Check if leader has manifestos
      const [[{ manifestoCount }]] = await connection.execute(
        'SELECT COUNT(*) as manifestoCount FROM manifestos WHERE leader_id = ?',
        [leaderId]
      ) as any;

      if (manifestoCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete leader with existing manifestos'
        });
      }

      await connection.execute('DELETE FROM leaders WHERE leader_id = ?', [leaderId]);

      await connection.commit();

      res.json({
        success: true,
        message: 'Leader deleted successfully'
      });
    } catch (error) {
      await connection.rollback();
      console.error('Error deleting leader:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete leader'
      });
    } finally {
      connection.release();
    }
  }

  // Get all manifestos with detailed statistics
  async getAllManifestos(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        leader_id = '',
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      let query = `
        SELECT 
          m.*,
          l.name as leader_name,
          l.party,
          l.image_url as leader_image,
          COALESCE(SUM(e.type = 'like'), 0) as likes,
          COALESCE(SUM(e.type = 'dislike'), 0) as dislikes,
          COALESCE(SUM(e.type = 'comment'), 0) as comments_count,
          COUNT(e.engagement_id) as total_engagements
        FROM manifestos m
        LEFT JOIN leaders l ON m.leader_id = l.leader_id
        LEFT JOIN manifesto_engagement e ON m.manifesto_id = e.manifesto_id
        WHERE 1=1
      `;

      const params: any[] = [];

      if (search) {
        query += ` AND (
          m.main_agenda LIKE ? OR
          m.agenda_items LIKE ? OR
          l.name LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (leader_id) {
        query += ` AND m.leader_id = ?`;
        params.push(leader_id);
      }

      query += ` GROUP BY m.manifesto_id`;

      // Add sorting
      const validSortColumns = ['created_at', 'likes', 'dislikes', 'comments_count', 'total_engagements'];
      const sortColumn = validSortColumns.includes(sortBy as string) ? sortBy : 'created_at';
      const sortDirection = sortOrder === 'ASC' ? 'ASC' : 'DESC';
      
      if (sortColumn === 'likes' || sortColumn === 'dislikes' || sortColumn === 'comments_count' || sortColumn === 'total_engagements') {
        query += ` ORDER BY ${sortColumn} ${sortDirection}`;
      } else {
        query += ` ORDER BY m.${sortColumn} ${sortDirection}`;
      }

      // Add pagination
      query += ` LIMIT ? OFFSET ?`;
      params.push(Number(limit), offset);

      const [manifestos] = await pool.execute(query, params);

      // Get total count
      let countQuery = `
        SELECT COUNT(DISTINCT m.manifesto_id) as total 
        FROM manifestos m
        LEFT JOIN leaders l ON m.leader_id = l.leader_id
        WHERE 1=1
      `;
      const countParams = params.slice(0, -2);

      if (search) {
        countQuery += ` AND (
          m.main_agenda LIKE ? OR
          m.agenda_items LIKE ? OR
          l.name LIKE ?
        )`;
      }

      if (leader_id) {
        countQuery += ` AND m.leader_id = ?`;
      }

      const [[{ total }]] = await pool.execute(countQuery, countParams) as any;

      res.json({
        success: true,
        data: {
          manifestos,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error fetching manifestos:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch manifestos'
      });
    }
  }

  // Get engagement analytics
  async getEngagementAnalytics(req: Request, res: Response) {
    try {
      const { period = '30days' } = req.query;
      
      let dateCondition = '';
      let params: any[] = [];

      switch (period) {
        case '7days':
          dateCondition = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
          break;
        case '30days':
          dateCondition = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
          break;
        case '90days':
          dateCondition = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
          break;
        case 'year':
          dateCondition = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
          break;
        default:
          dateCondition = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
      }

      // Get engagement trends by day
      const [dailyEngagement] = await pool.execute(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as total,
          SUM(CASE WHEN type = 'like' THEN 1 ELSE 0 END) as likes,
          SUM(CASE WHEN type = 'dislike' THEN 1 ELSE 0 END) as dislikes,
          SUM(CASE WHEN type = 'comment' THEN 1 ELSE 0 END) as comments
        FROM manifesto_engagement
        ${dateCondition}
        GROUP BY DATE(created_at)
        ORDER BY date
      `, params);

      // Get top engaging users
      const [topUsers] = await pool.execute(`
        SELECT 
          u.id,
          u.anonymous_username,
          u.gender,
          u.age_bracket,
          u.county,
          COUNT(e.engagement_id) as total_engagements,
          SUM(CASE WHEN e.type = 'like' THEN 1 ELSE 0 END) as likes_given,
          SUM(CASE WHEN e.type = 'dislike' THEN 1 ELSE 0 END) as dislikes_given,
          SUM(CASE WHEN e.type = 'comment' THEN 1 ELSE 0 END) as comments_given
        FROM users u
        LEFT JOIN manifesto_engagement e ON u.id = e.user_id
        ${dateCondition.replace('created_at', 'e.created_at')}
        GROUP BY u.id
        ORDER BY total_engagements DESC
        LIMIT 10
      `, params);

      // Get engagement by hour of day
      const [hourlyEngagement] = await pool.execute(`
        SELECT 
          HOUR(created_at) as hour,
          COUNT(*) as total_engagements
        FROM manifesto_engagement
        ${dateCondition}
        GROUP BY HOUR(created_at)
        ORDER BY hour
      `, params);

      // Get engagement by day of week
      const [weeklyEngagement] = await pool.execute(`
        SELECT 
          DAYNAME(created_at) as day,
          COUNT(*) as total_engagements
        FROM manifesto_engagement
        ${dateCondition}
        GROUP BY DAYNAME(created_at), DAYOFWEEK(created_at)
        ORDER BY DAYOFWEEK(created_at)
      `, params);

      // Get demographic engagement breakdown
      const [demographicEngagement] = await pool.execute(`
        SELECT 
          u.gender,
          u.age_bracket,
          COUNT(e.engagement_id) as total_engagements,
          COUNT(DISTINCT e.user_id) as unique_users
        FROM users u
        LEFT JOIN manifesto_engagement e ON u.id = e.user_id
        ${dateCondition.replace('created_at', 'e.created_at')}
        WHERE u.gender IS NOT NULL AND u.age_bracket IS NOT NULL
        GROUP BY u.gender, u.age_bracket
      `, params);

      res.json({
        success: true,
        data: {
          dailyEngagement,
          topUsers,
          hourlyEngagement,
          weeklyEngagement,
          demographicEngagement,
          period
        }
      });
    } catch (error) {
      console.error('Error fetching engagement analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch engagement analytics'
      });
    }
  }

  // Get platform growth metrics
  async getGrowthMetrics(req: Request, res: Response) {
    try {
      const { months = 12 } = req.query;
      
      // Get user growth by month
      const [userGrowth] = await pool.execute(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as new_users,
          SUM(COUNT(*)) OVER (ORDER BY DATE_FORMAT(created_at, '%Y-%m')) as total_users
        FROM users
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month
      `, [Number(months)]);

      // Get leader growth by month
      const [leaderGrowth] = await pool.execute(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as new_leaders,
          SUM(COUNT(*)) OVER (ORDER BY DATE_FORMAT(created_at, '%Y-%m')) as total_leaders
        FROM leaders
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month
      `, [Number(months)]);

      // Get manifesto growth by month
      const [manifestoGrowth] = await pool.execute(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as new_manifestos,
          SUM(COUNT(*)) OVER (ORDER BY DATE_FORMAT(created_at, '%Y-%m')) as total_manifestos
        FROM manifestos
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month
      `, [Number(months)]);

      // Get engagement growth by month
      const [engagementGrowth] = await pool.execute(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as new_engagements,
          SUM(COUNT(*)) OVER (ORDER BY DATE_FORMAT(created_at, '%Y-%m')) as total_engagements
        FROM manifesto_engagement
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month
      `, [Number(months)]);

      // Calculate growth rates
      const calculateGrowthRate = (data: any[]) => {
        if (data.length < 2) return 0;
        const lastMonth = data[data.length - 1].new_users || 0;
        const prevMonth = data[data.length - 2].new_users || 0;
        if (prevMonth === 0) return lastMonth > 0 ? 100 : 0;
        return ((lastMonth - prevMonth) / prevMonth) * 100;
      };

      res.json({
        success: true,
        data: {
          userGrowth,
          leaderGrowth,
          manifestoGrowth,
          engagementGrowth,
          growthRates: {
            userGrowthRate: calculateGrowthRate(userGrowth as any[]),
            leaderGrowthRate: calculateGrowthRate(leaderGrowth as any[]),
            manifestoGrowthRate: calculateGrowthRate(manifestoGrowth as any[]),
            engagementGrowthRate: calculateGrowthRate(engagementGrowth as any[])
          }
        }
      });
    } catch (error) {
      console.error('Error fetching growth metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch growth metrics'
      });
    }
  }

  // Export data (CSV format)
  async exportData(req: Request, res: Response) {
    try {
      const { type, format = 'csv' } = req.query;

      let data: any[] = [];
      let filename = 'export';

      switch (type) {
        case 'users':
          [data] = await pool.execute(`
            SELECT 
              user_id,
              anonymous_username,
              gender,
              age_bracket,
              county,
              ward,
              voter_card,
              will_vote,
              is_verified,
              created_at
            FROM users
            ORDER BY created_at DESC
          `);
          filename = 'users_export';
          break;

        case 'leaders':
          [data] = await pool.execute(`
            SELECT 
              leader_id,
              name,
              party,
              location,
              tags,
              status,
              position,
              verification,
              likes,
              dislikes,
              views,
              manifesto_approvals,
              comments_count,
              created_at
            FROM leaders
            ORDER BY created_at DESC
          `);
          filename = 'leaders_export';
          break;

        case 'manifestos':
          [data] = await pool.execute(`
            SELECT 
              m.manifesto_id,
              m.leader_id,
              l.name as leader_name,
              m.main_agenda,
              m.agenda_items,
              m.pdf_url,
              m.created_at
            FROM manifestos m
            LEFT JOIN leaders l ON m.leader_id = l.leader_id
            ORDER BY m.created_at DESC
          `);
          filename = 'manifestos_export';
          break;

        case 'engagements':
          [data] = await pool.execute(`
            SELECT 
              e.engagement_id,
              e.manifesto_id,
              m.main_agenda,
              e.user_id,
              u.anonymous_username,
              e.type,
              e.comment,
              e.created_at
            FROM manifesto_engagement e
            LEFT JOIN manifestos m ON e.manifesto_id = m.manifesto_id
            LEFT JOIN users u ON e.user_id = u.id
            ORDER BY e.created_at DESC
          `);
          filename = 'engagements_export';
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid export type'
          });
      }

      if (format === 'csv') {
        // Convert to CSV
        const csvData = convertToCSV(data as any[]);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        
        return res.send(csvData);
      } else if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}_${new Date().toISOString().split('T')[0]}.json`);
        
        return res.json({
          success: true,
          data
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid export format'
        });
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export data'
      });
    }
  }
}

// Helper function to convert data to CSV
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle values that might contain commas or quotes
      if (value === null || value === undefined) return '';
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

export default new AdminController();