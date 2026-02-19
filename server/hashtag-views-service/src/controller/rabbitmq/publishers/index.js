const { getBroker } = require('../index');
const Logger = require('../../../utils/logger/logger');

class BasePublisher {
  constructor(publicationName) {
    this.publicationName = publicationName;
  }

  async publish(eventData, options = {}) {
    try {
      const broker = await getBroker();
      
      const publication = await broker.publish(this.publicationName, {
        ...eventData,
        timestamp: Date.now(),
        source: 'api-server',
        retryCount: 0
      }, {
        persistent: true,
        ...options
      });

      publication.on('success', () => {
        Logger.info(`✅ Published ${this.publicationName} event`);
      });

      publication.on('error', (err) => {
        Logger.error(`❌ Failed to publish ${this.publicationName} event:`, err.message);
      });

      return publication;
    } catch (error) {
      Logger.error(`Failed to publish ${this.publicationName} event:`, error.message);
      // Don't throw - allow request to continue even if publishing fails
      return null;
    }
  }

  async publishBatch(events = []) {
    const publications = [];
    for (const event of events) {
      const publication = await this.publish(event);
      if (publication) publications.push(publication);
    }
    return publications;
  }
}

class HashtagPublisher extends BasePublisher {
  constructor() {
    super('hashtag_publication');
  }

  async publishHashtagEvent(postId, hashtag, userId) {
    const formattedHashtag = hashtag.startsWith('#') 
      ? hashtag.toLowerCase() 
      : `#${hashtag.toLowerCase()}`;
    
    return this.publish({
      postId,
      hashtag: formattedHashtag,
      userId: userId || null,
      action: 'create',
      eventType: 'hashtag'
    });
  }
}

class ViewPublisher extends BasePublisher {
  constructor() {
    super('view_publication');
  }

  async publishViewEvent(videoId, userId = null, metadata = {}) {
    return this.publish({
      videoId,
      userId,
      metadata: {
        ...metadata,
        userAgent: metadata.userAgent || req?.headers['user-agent'] || 'unknown',
        ipAddress: metadata.ipAddress || req?.ip || 'unknown',
        timestamp: new Date().toISOString()
      },
      action: 'create',
      eventType: 'view'
    });
  }
}

class LikePublisher extends BasePublisher {
  constructor() {
    super('like_publication');
  }

  async publishLikeEvent(videoId, userId = null, action = 'like') {
    return this.publish({
      videoId,
      userId,
      action: action === 'like' ? 'like' : 'unlike',
      eventType: 'like'
    });
  }
}

// Export singleton instances
module.exports = {
  hashtagPublisher: new HashtagPublisher(),
  viewPublisher: new ViewPublisher(),
  likePublisher: new LikePublisher()
};