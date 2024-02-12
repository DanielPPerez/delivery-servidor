import Pedidos from '../models/Pedidos.model.js';
import Usuario from '../models/Users.model.js';
import Producto from '../models/Products.model.js';
import express from 'express';

const notificationRouter = express.Router();
const shortPollingRouter = express.Router();
const longPollingClients = [];

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

notificationRouter.get('/wait', (req, res) => {
  // Mantener la conexión abierta hasta que haya un nuevo pedido
  longPollingClients.push(res);
});

export { notificationRouter, shortPollingRouter };

let numeroPedidoActual = 0; // Variable para mantener el número de pedido actual

export const crearPedido = async (req, res) => {
  try {
    const { userEmail, detallesVenta, subtotal, serviceCost, total } = req.body;

    const usuario = await Usuario.findOne({ email: userEmail });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    let totalProducts = 0;
    const productosComprados = [];

    for (const detalle of detallesVenta) {
      const producto = await Producto.findOne({ title: detalle.name.trim() });

      if (!producto) {
        return res.status(404).json({ message: `Producto no encontrado: ${detalle.name}` });
      }

      // Verificar si hay suficiente cantidad disponible para comprar
      if (detalle.quantity > producto.quantity) {
        const errorMessage = `Cantidad no disponible para: ${detalle.name}`;
        sendErrorResponse(errorMessage, res);
        return;
      }

      const pedido = new Pedidos({
        user: usuario._id,
        products: [{ product: producto._id, title: detalle.name, quantity: detalle.quantity }],
        totalAmount: detalle.quantity * producto.price,
        numeroPedido: ++numeroPedidoActual, // Incrementar y asignar el número de pedido
      });

      totalProducts += pedido.totalAmount;

      // Restar la cantidad comprada del inventario del producto
      producto.quantity -= detalle.quantity;

      const result = await pedido.save();

      // Agregar el _id del pedido al array 'compras' del usuario
      usuario.compras.push(result._id);

      productosComprados.push({ _id: producto._id, quantity: detalle.quantity });
    }

    await usuario.save();
    await Promise.all(productosComprados.map(producto => Producto.findByIdAndUpdate(producto._id, { $inc: { quantity: -producto.quantity } })));

    // Notificar a los clientes de long polling sobre el nuevo pedido
    notifyLongPollingClients();

    // Enviar el número de pedido y la información necesaria al frontend
    sendSuccessResponse({ numeroPedido: numeroPedidoActual, message: "Pedido creado con éxito" }, res);
  } catch (error) {
    console.error(error);
    sendErrorResponse("Error al crear el pedido", res);
  }
};


function sendSuccessResponse(message, res) {
  res.json({ alert: { type: "success", message } });
}

function sendErrorResponse(message, res) {
  res.status(500).json({ alert: { type: "error", message } });
}

// Controlador para obtener todos los pedidos
export const obtenerPedidos = async (req, res) => {
  try {
    const pedidos = await Pedidos.find().populate('user').populate('products.product');
    
    const pedidosDetallados = pedidos.map((pedido) => ({
      _id: pedido._id,
      user: pedido.user,
      products: pedido.products.map((item) => ({
        title: item.product.title || 'Producto no disponible',
        quantity: item.quantity,
        totalProduct: item.quantity * (item.product.price || 0),
      })),
      totalAmount: pedido.totalAmount,
      createdAt: pedido.createdAt,
    }));

    res.json({ pedidos: pedidosDetallados });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al recuperar los pedidos.' });
  }
};

// Función para notificar a los clientes de long polling sobre un nuevo pedido
function notifyLongPollingClients() {
  while (longPollingClients.length > 0) {
    const client = longPollingClients.pop();
    client.json({ numeroPedido: numeroPedidoActual, message: 'Nuevo pedido disponible' });
  }
}
