import Product from '../models/Products.model.js';
import multer from 'multer';

// Configuración de multer para almacenar las imágenes en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Controlador para crear un producto
export const crearproducto = async (req, res) => {
  upload.single('img')(req, res, async (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al cargar la imagen.' });
      return;
    }

    try {
      const { title, desc, price, quantity } = req.body;

      // Verificar que se hayan proporcionado los datos necesarios
      if (!title || !price || !quantity) {
        res.status(400).json({ message: 'Por favor, proporcione todos los campos obligatorios.' });
        return;
      }

      // Guardar la imagen en el modelo de producto
      const imgBuffer = req.file.buffer;
      const product = new Product({ title, desc, price, quantity, img: imgBuffer });

      // Guardar el producto en la base de datos
      const productoGuardado = await product.save();
      res.status(201).json(productoGuardado);
    } catch (error) {
      console.error('Error al crear el producto:', error);
      res.status(500).json({ message: 'Error al crear el producto.' });
    }
  });
};

// Controlador para editar un producto
export const editarProducto = async (req, res) => {
  upload.single('img')(req, res, async (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al cargar la imagen.' });
      return;
    }

    try {
      const { id } = req.params;
      const { title, desc, price, quantity } = req.body;

      // Verificar que se hayan proporcionado los datos necesarios
      if (!title || !price || !quantity) {
        res.status(400).json({ message: 'Por favor, proporcione todos los campos obligatorios.' });
        return;
      }

      // Preparar los datos de actualización
      const updateData = { title, desc, price, quantity };

      // Si se proporciona una nueva imagen, agregarla al objeto de actualización
      if (req.file) {
        updateData.img = req.file.buffer;
      }

      // Actualizar el producto en la base de datos
      const productoActualizado = await Product.findByIdAndUpdate(id, updateData, { new: true });

      if (!productoActualizado) {
        res.status(404).json({ message: 'Producto no encontrado.' });
        return;
      }

      res.json(productoActualizado);
    } catch (error) {
      console.error('Error al editar el producto:', error);
      res.status(500).json({ message: 'Error al editar el producto.' });
    }
  });
};


// Controlador para obtener los productos
export const obtener = async (req, res) => {
  try {
    const productos = await Product.find();

    // Mapear productos para incluir la imagen como base64
    const productosConImagen = productos.map(producto => {
      return {
        _id: producto._id,
        title: producto.title,
        desc: producto.desc,
        img: producto.img ? producto.img.toString('base64') : '', 
        price: producto.price,
        quantity: producto.quantity,
        createdAt: producto.createdAt,
      };
    });

    res.json(productosConImagen);
  } catch (error) {
    console.error('Error al recuperar los productos:', error);
    res.status(500).json({ message: 'Error al recuperar los productos.' });
  }
};



// Controlador para borrar un producto
export const borrarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    // Eliminar el producto de la base de datos
    const productoEliminado = await Product.findByIdAndDelete(id);

    if (!productoEliminado) {
      res.status(404).json({ message: 'Producto no encontrado.' });
      return;
    }

    res.json({ message: 'Producto eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al borrar el producto:', error);
    res.status(500).json({ message: 'Error al borrar el producto.' });
  }
};
