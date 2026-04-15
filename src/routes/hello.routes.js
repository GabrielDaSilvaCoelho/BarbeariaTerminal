const express = require('express');
const router = express.Router();

const { getChannel, QUEUE_NAME } = require('../config/rabbitmq');

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Mensagem obrigatória' });
    }

    const channel = getChannel();
    channel.sendToQueue(QUEUE_NAME, Buffer.from(message));

    console.log('Mensagem enviada para a fila:', message);

    return res.status(200).json({
      success: true,
      message: 'Mensagem enviada com sucesso para a fila'
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem para a fila:', error.message);
    return res.status(500).json({
      error: 'Erro ao publicar mensagem no broker'
    });
  }
});

module.exports = router;