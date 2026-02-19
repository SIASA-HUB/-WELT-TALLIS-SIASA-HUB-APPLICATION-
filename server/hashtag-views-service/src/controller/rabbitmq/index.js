const rascal = require('rascal');
const Logger = require('../../utils/logger/logger');

const brokerConfig = {
  vhosts: {
    '/': {
      connection: {
        url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
      },
      exchanges: {
        'social_events_exchange': {
          type: 'topic',
          durable: true
        },
        'social_events_dlx': {
          type: 'topic',
          durable: true
        }
      },
      queues: {
        'hashtag_events_queue': {
          durable: true,
          deadLetterExchange: 'social_events_dlx',
          deadLetterRoutingKey: 'event.hashtag.failed'
        },
        'view_events_queue': {
          durable: true,
          deadLetterExchange: 'social_events_dlx',
          deadLetterRoutingKey: 'event.view.failed'
        },
        'like_events_queue': {
          durable: true,
          deadLetterExchange: 'social_events_dlx',
          deadLetterRoutingKey: 'event.like.failed'
        },
        'failed_events_queue': {
          durable: true
        }
      },
      bindings: {
        'hashtag_binding': {
          source: 'social_events_exchange',
          destination: 'hashtag_events_queue',
          destinationType: 'queue',
          bindingKey: 'hashtag.#'
        },
        'view_binding': {
          source: 'social_events_exchange',
          destination: 'view_events_queue',
          destinationType: 'queue',
          bindingKey: 'view.#'
        },
        'like_binding': {
          source: 'social_events_exchange',
          destination: 'like_events_queue',
          destinationType: 'queue',
          bindingKey: 'like.#'
        },
        'failed_hashtag_binding': {
          source: 'social_events_dlx',
          destination: 'failed_events_queue',
          destinationType: 'queue',
          bindingKey: 'event.hashtag.failed'
        },
        'failed_view_binding': {
          source: 'social_events_dlx',
          destination: 'failed_events_queue',
          destinationType: 'queue',
          bindingKey: 'event.view.failed'
        },
        'failed_like_binding': {
          source: 'social_events_dlx',
          destination: 'failed_events_queue',
          destinationType: 'queue',
          bindingKey: 'event.like.failed'
        }
      },
      publications: {
        'hashtag_publication': {
          exchange: 'social_events_exchange',
          routingKey: 'hashtag.create',
          confirm: true,
          options: {
            persistent: true
          }
        },
        'view_publication': {
          exchange: 'social_events_exchange',
          routingKey: 'view.create',
          confirm: true,
          options: {
            persistent: true
          }
        },
        'like_publication': {
          exchange: 'social_events_exchange',
          routingKey: 'like.create',
          confirm: true,
          options: {
            persistent: true
          }
        }
      },
      subscriptions: {
        'hashtag_subscription': {
          queue: 'hashtag_events_queue',
          prefetch: 50,
          retry: {
            delay: 1000,
            factor: 2,
            max: 15000,
            attempts: 3
          }
        },
        'view_subscription': {
          queue: 'view_events_queue',
          prefetch: 100,
          retry: {
            delay: 500,
            factor: 2,
            max: 5000,
            attempts: 5
          }
        },
        'like_subscription': {
          queue: 'like_events_queue',
          prefetch: 100,
          retry: {
            delay: 500,
            factor: 2,
            max: 5000,
            attempts: 5
          }
        }
      }
    }
  }
};

let broker = null;

async function getBroker() {
  if (broker) return broker;

  try {
    broker = await new Promise((resolve, reject) => {
      rascal.Broker.create(rascal.withDefaultConfig(brokerConfig), (err, createdBroker) => {
        if (err) return reject(err);
        resolve(createdBroker);
      });
    });

    broker.on('error', (err) => {
      Logger.error('Rascal broker error:', err.message);
    });

    broker.on('blocked', (reason) => {
      Logger.warn('RabbitMQ broker blocked:', reason);
    });

    broker.on('unblocked', () => {
      Logger.info('RabbitMQ broker unblocked');
    });

    Logger.info('✅ Rascal broker created and initialized');
    return broker;
  } catch (err) {
    Logger.error('Failed to create Rascal broker:', err);
    throw err;
  }
}

// Graceful shutdown
async function shutdown() {
  if (broker) {
    try {
      await broker.shutdown();
      Logger.info('RabbitMQ broker shutdown gracefully');
    } catch (error) {
      Logger.error('Error during RabbitMQ shutdown:', error);
    }
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = { getBroker, shutdown };