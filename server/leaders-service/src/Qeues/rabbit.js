// /Qeues/rabbit.js
const amqp = require("amqplib");
const Logger = require("../utils/logger/logger");

let connection = null;
let channel = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";
const EXCHANGE_NAME = "siasa_hub_exchange";

const QUEUES = {
  LEADER_BOOST: "leader_boost_queue",
  WALLET_DEDUCTION: "wallet_deduction_queue",
  NOTIFICATION: "notification_queue",
  ANALYTICS: "analytics_queue",
  ADMIN_EVENTS: "admin_events_queue",
};

// Connect to RabbitMQ
const connectRabbitMQ = async () => {
  if (process.env.RABBITMQ_ENABLED === "false") {
    Logger.warn("⚠️ RabbitMQ is disabled via RABBITMQ_ENABLED=false. Skipping connection.");
    return null;
  }

  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    // Create exchange
    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });

    // Create queues
    for (const [key, queueName] of Object.entries(QUEUES)) {
      await channel.assertQueue(queueName, { durable: true });
      await channel.bindQueue(queueName, EXCHANGE_NAME, `${key}.*`);
    }

    Logger.info("✅ RabbitMQ connected successfully");

    connection.on("close", () => {
      Logger.error("RabbitMQ connection closed, reconnecting...");
      setTimeout(connectRabbitMQ, 5000);
    });

    return channel;
  } catch (error) {
    Logger.error("❌ RabbitMQ connection error:", error.message);
    // Don't retry if connection refused and disabled
    if (error.code === 'ECONNREFUSED') {
       Logger.warn("RabbitMQ server refused connection. Retrying in 30s...");
       setTimeout(connectRabbitMQ, 30000);
    } else {
       setTimeout(connectRabbitMQ, 5000);
    }
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
