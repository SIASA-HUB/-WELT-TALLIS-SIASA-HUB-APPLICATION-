// /Qeues/rabbit.js
const amqp = require("amqplib");
const Logger = require("../utils/logger/logger");

let connection = null;
let channel = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";
const EXCHANGE_NAME = "siasa_hub_exchange";

const QUEUES = {
  // Worker queues used by LeaderController
  LEADER_IMAGE_UPLOAD: "leader_image_upload_queue",
  LEADER_CACHE_CLEAR: "leader_cache_clear_queue",
  LEADER_BOOST_STATS: "leader_boost_stats_queue",
  // General queues
  LEADER_BOOST: "leader_boost_queue",
  WALLET_DEDUCTION: "wallet_deduction_queue",
  NOTIFICATION: "notification_queue",
  ANALYTICS: "analytics_queue",
  ADMIN_EVENTS: "admin_events_queue",
};

// Connect to RabbitMQ — fully graceful, never crashes the service
const connectRabbitMQ = async () => {
  if (process.env.RABBITMQ_ENABLED === "false") {
    Logger.warn("⚠️ RabbitMQ disabled via RABBITMQ_ENABLED=false. Skipping.");
    return null;
  }

  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });

    for (const [key, queueName] of Object.entries(QUEUES)) {
      await channel.assertQueue(queueName, { durable: true });
      await channel.bindQueue(queueName, EXCHANGE_NAME, `${key}.*`);
    }

    Logger.info("✅ RabbitMQ connected successfully");

    connection.on("close", () => {
      Logger.error("RabbitMQ connection closed, reconnecting in 30s...");
      setTimeout(connectRabbitMQ, 30000);
    });

    connection.on("error", (err) => {
      Logger.error("RabbitMQ connection error:", err.message);
    });

    return channel;
  } catch (error) {
    Logger.warn(`⚠️ RabbitMQ unavailable (${error.message}). Service will run without queue support.`);
    return null;
  }
};

// Publish message to exchange
const publishMessage = async (routingKey, message) => {
  if (!channel) {
    Logger.error("RabbitMQ channel not available");
    return false;
  }

  try {
    channel.publish(
      EXCHANGE_NAME,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true },
    );
    Logger.info(`📤 Message published: ${routingKey}`);
    return true;
  } catch (error) {
    Logger.error("Error publishing message:", error);
    return false;
  }
};

// Consume messages from queue
const consumeMessages = async (queueName, callback) => {
  if (!channel) {
    Logger.error("RabbitMQ channel not available");
    return;
  }

  try {
    await channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content);
          channel.ack(msg);
        } catch (error) {
          Logger.error("Error processing message:", error);
          channel.nack(msg, false, true);
        }
      }
    });
    Logger.info(`📥 Consuming from queue: ${queueName}`);
  } catch (error) {
    Logger.error("Error consuming messages:", error);
  }
};

module.exports = {
  connectRabbitMQ,
  publishMessage,
  consumeMessages,
  QUEUES,
  EXCHANGE_NAME,
};
