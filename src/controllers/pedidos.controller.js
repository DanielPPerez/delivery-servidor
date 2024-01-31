class Notificador {
  constructor() {
    this.observadores = [];
  }

  agregarObservador(socketId) {
    this.observadores.push(socketId);
  }

  notificarNuevoPedido(pedido) {
    this.observadores.forEach((socketId) => {
      io.to(socketId).emit('nuevoPedido', pedido);
    });
  }
}

const notificador = new Notificador();

export const notificaciones = async (req, res) => {
  const socketId = req.query.socketId;
  notificador.agregarObservador(socketId);

  try {
    const nuevasNotificaciones = await esperarNotificaciones();
    res.json(nuevasNotificaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

const esperarNotificaciones = () => {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve([]);
    }, 30000);

    const checkForNotifications = () => {
      const nuevasNotificaciones = notificador.observadores.map((socketId) => ({ socketId, mensaje: 'Nuevo pedido disponible.' }));

      if (nuevasNotificaciones.length > 0) {
        clearTimeout(timeout);
        resolve(nuevasNotificaciones);
      } else {
        setTimeout(checkForNotifications, 1000);
      }
    };

    checkForNotifications();
  });
};

export const realizarPedido = async (req, res) => {
  try {
    const { numeroPedido, nombreCliente } = req.body;

    const pedido = {
      numeroPedido,
      nombreCliente,
      mensaje: `Nuevo pedido #${numeroPedido} de ${nombreCliente}. Llegará en 45 minutos.`,
    };

    notificador.notificarNuevoPedido(pedido);

    res.status(200).json({ message: 'Pedido recibido correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

export const VerificarProductos = async (req, res) => {
  try {
    // Obtener todos los productos
    const productos = await Producto.find();

    // Verificar productos agotados y actualizar su estado
    const productosAgotados = [];
    for (const producto of productos) {
      if (producto.quantity === 0) {
        // Marcar como agotado
        producto.agotado = true;
        productosAgotados.push(producto.title);
      } else {
        // Producto no agotado
        producto.agotado = false;
      }
      // Guardar el cambio en la base de datos
      await producto.save();
    }

    if (productosAgotados.length > 0) {
      // Si hay productos agotados, notificar a los observadores
      const mensaje = `Los siguientes productos están agotados: ${productosAgotados.join(', ')}`;
      notificador.notificarNuevoPedido({ mensaje });
    }

    res.status(200).json({ message: 'Verificación de productos completada.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};
