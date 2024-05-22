import Producto from '../models/Products.model.js';
import express from 'express';
import cors from 'cors';

const shortPollingRouter = express.Router();
const longPollingRouter = express.Router();
const longPollingClients = [];

shortPollingRouter.use(cors());
longPollingRouter.use(cors());

shortPollingRouter.get('/checkAvailability', async (req, res) => {
  try {
    const productos = await Producto.find();
    const productosAgotados = productos.filter(producto => producto.quantity === 0).map(producto => producto.title);

    res.json({ productosAgotados });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al verificar la disponibilidad de productos.' });
  }
});

longPollingRouter.get('/wait', (req, res) => {
  longPollingClients.push(res);
});

function notifyLongPollingClients(newPedido) {
  while (longPollingClients.length > 0) {
    const client = longPollingClients.pop();

    if (!client.headersSent) {
      try {
        client.json({
          eventType: 'newPedido',
          eventData: {
            numeroPedido: newPedido.numeroPedido,
            userEmail: newPedido.userEmail,
            detallesVenta: newPedido.detallesVenta,
          },
        });
        client.end();
      } catch (error) {
        console.error('Error al enviar la notificación al cliente de long polling:', error);
        client.status(500).json({ error: 'Error al enviar la notificación al cliente de long polling.' });
      }
    }
  }
}

export { shortPollingRouter, longPollingRouter, notifyLongPollingClients };
