const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'barberpro_hello_queue';

let connection;
let channel;

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: false });

    console.log('RabbitMQ conectado com sucesso');
  } catch (error) {
    console.error('Erro ao conectar no RabbitMQ:', error.message);
  }
}

function getChannel() {
  if (!channel) {
    throw new Error('Canal RabbitMQ ainda não foi inicializado');
  }
  return channel;
}

module.exports = {
  connectRabbitMQ,
  getChannel,
  QUEUE_NAME
};