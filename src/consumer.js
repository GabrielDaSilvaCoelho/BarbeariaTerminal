const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'barberpro_hello_queue';

async function startConsumer() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: false });

    console.log('Consumer aguardando mensagens...');

    channel.consume(QUEUE_NAME, (msg) => {
      if (msg) {
        const content = msg.content.toString();
        console.log('Mensagem recebida da fila:', content);
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error('Erro no consumer:', error.message);
  }
}

startConsumer();