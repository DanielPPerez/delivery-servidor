import Producto from '../models/Products.model.js';
import multer from 'multer';

// Configuración de Multer para gestionar la carga de imágenes
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Manejar la creación de productos
export const crearproducto = async (req, res) => {
  try {
    // Procesar la carga de imagen con multer
    upload.single('img')(req, res, async (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al cargar la imagen.' });
        return;
      }

      // Resto de la lógica para crear el producto
      const { title, desc, price, options, quantity } = req.body;
      const img = req.file.buffer.toString('base64');
      
      const producto = new Producto({ title, desc, img, price, options, quantity });
      const productoGuardado = await producto.save();
      res.status(201).json(productoGuardado);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el producto.' });
  }
};

// Manejar la recuperación de productos
export const obtener = async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al recuperar los productos.' });
  }
};
