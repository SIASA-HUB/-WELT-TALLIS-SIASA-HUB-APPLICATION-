const { getBroker } = require('../index');
const { safeQuery, safeQueryOne } = require('../../../configurations/db');
const Logger = require('../../../utils/logger/logger');

class BaseConsumer {
  constructor(subscriptionName) {
    this.subscriptionName = subscriptionName;
    this.isConsuming = false;
  }

  async startConsuming() {
    if (this.isConsuming) {
      Logger.warn(`Already consuming from ${this.subscriptionName}`);
      return;
    }

    try {
      const broker = await getBroker();
      const subscription = await broker.subscribe(this.subscriptionName, async (err, message) => {
        if (err) {
          Logger.error(`Error in subscription ${this.subscriptionName}:`, err);
          return;
        }

        try {
          await this.processMessage(message.content);
          message.ack();
        } catch (error) {
          Logger.error(`Failed to process message in ${this.subscriptionName}:`, {
            error: error.message,
            message: message.content
          });
          message.nack();
        }
      });

      subscription.on('error', (err) => {
        Logger.error(`Subscription ${this.subscriptionName} error:`, err);
      });

      subscription.on('cancel', (err) => {
        Logger.warn(`Subscription ${this.subscriptionName} cancelled:`, err);
        this.isConsuming = false;
        // Attempt to restart after delay
        setTimeout(() => this.startConsuming(), 5000);
      });

      this.isConsuming = true;
      Logger.info(`✅ Started consuming from ${this.subscriptionName}`);
    } catch (error) {
      Logger.error(`Failed to start consuming from ${this.subscriptionName}:`, error.message);
      // Retry after delay
      setTimeout(() => this.startConsuming(), 5000);
    }
  }

  async stopConsuming() {
    this.isConsuming = false;
  }
}

class HashtagConsumer extends BaseConsumer {
  constructor() {
    super('hashtag_subscription');
  }

  async processMessage(message) {
    Logger.info(`📥 Processing hashtag event: ${message.hashtag} for post ${message.postId}`);
    
    try {
      // Batch process to reduce database load
      await safeQuery(
        'INSERT INTO post_hashtags (post_id, hashtag, user_id, created_at) VALUES (?, ?, ?, NOW())',
        [message.postId, message.hashtag, message.userId]
      );

      // Update hashtag statistics (async - don't block)
      setImmediate(async () => {
        try {
          await safeQuery(
            'INSERT INTO hashtag_stats (hashtag, post_count, last_used) VALUES (?, 1, NOW()) ' +
            'ON DUPLICATE KEY UPDATE post_count = post_count + 1, last_used = NOW()',
            [message.hashtag]
          );
        } catch (statsError) {
          Logger.error('Failed to update hashtag stats:', statsError.message);
        }
      });

      Logger.info(`✅ Processed hashtag: ${message.hashtag} for post ${message.postId}`);
    } catch (error) {
      Logger.error(`❌ Failed to process hashtag event:`, {
        message: error.message,
        event: message
      });
      throw error;
    }
  }
}

class ViewConsumer extends BaseConsumer {
  constructor() {
    super('view_subscription');
  }

  async processMessage(message) {
    Logger.info(`📥 Processing view event for video: ${message.videoId}`);
    
    try {
      // Use atomic increment to prevent race conditions
      await safeQuery(
        'UPDATE backup_videos SET views = views + 1 WHERE id = ?',
        [message.videoId]
      );

      // Optionally track view analytics
      if (message.userId) {
        setImmediate(async () => {
          try {
            await safeQuery(
              'INSERT INTO video_view_analytics (video_id, user_id, viewed_at, user_agent, ip_address) ' +
              'VALUES (?, ?, NOW(), ?, ?)',
              [
                message.videoId,
                message.userId,
                message.metadata?.userAgent || 'unknown',
                message.metadata?.ipAddress || 'unknown'
              ]
            );
          } catch (analyticsError) {
            Logger.error('Failed to record view analytics:', analyticsError.message);
          }
        });
      }

      Logger.info(`✅ Processed view for video: ${message.videoId}`);
    } catch (error) {
      Logger.error(`❌ Failed to process view event:`, {
        message: error.message,
        event: message
      });
      throw error;
    }
  }
}

class LikeConsumer extends BaseConsumer {
  constructor() {
    super('like_subscription');
  }

  async processMessage(message) {
    Logger.info(`📥 Processing like event for video: ${message.videoId}, action: ${message.action}`);
    
    try {
      if (message.action === 'like') {
        // Increment likes
        await safeQuery(
          'UPDATE backup_videos SET likes = likes + 1 WHERE id = ?',
          [message.videoId]
        );

        // Record like in separate table if needed
        if (message.userId) {
          setImmediate(async () => {
            try {
              await safeQuery(
                'INSERT INTO video_likes (video_id, user_id, liked_at) VALUES (?, ?, NOW()) ' +
                'ON DUPLICATE KEY UPDATE liked_at = NOW()',
                [message.videoId, message.userId]
              );
            } catch (likeError) {
              Logger.error('Failed to record like:', likeError.message);
            }
          });
        }
      } else if (message.action === 'unlike') {
        // Decrement likes
        await safeQuery(
          'UPDATE backup_videos SET likes = GREATEST(likes - 1, 0) WHERE id = ?',
          [message.videoId]
        );

        // Remove like record if needed
        if (message.userId) {
          setImmediate(async () => {
            try {
              await safeQuery(
                'DELETE FROM video_likes WHERE video_id = ? AND user_id = ?',
                [message.videoId, message.userId]
              );
            } catch (unlikeError) {
              Logger.error('Failed to remove like:', unlikeError.message);
            }
          });
        }
      }

      Logger.info(`✅ Processed ${message.action} for video: ${message.videoId}`);
    } catch (error) {
      Logger.error(`❌ Failed to process like event:`, {
        message: error.message,
        event: message
      });
      throw error;
    }
  }
}

// Initialize and export consumers
const hashtagConsumer = new HashtagConsumer();
const viewConsumer = new ViewConsumer();
const likeConsumer = new LikeConsumer();

// Start all consumers
function startAllConsumers() {
  hashtagConsumer.startConsuming();
  viewConsumer.startConsuming();
  likeConsumer.startConsuming();
  Logger.info('🚀 All RabbitMQ consumers started');
}

// Stop all consumers
function stopAllConsumers() {
  hashtagConsumer.stopConsuming();
  viewConsumer.stopConsuming();
  likeConsumer.stopConsuming();
  Logger.info('🛑 All RabbitMQ consumers stopped');
}

module.exports = {
  hashtagConsumer,
  viewConsumer,
  likeConsumer,
  startAllConsumers,
  stopAllConsumers
};