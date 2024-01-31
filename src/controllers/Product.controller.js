import Product from '../models/Products.model.js';
import multer from 'multer';


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


export const crearproducto = async (req, res) => {
  try {
    upload.array('img')(req, res, async (err) => {
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
        const imgBuffers = req.files.map(file => file.buffer);

        const product = new Product({ title, desc, price, quantity, img: imgBuffers[0] });

        // Guardar el producto en la base de datos
        const productoGuardado = await product.save();

        res.status(201).json(productoGuardado);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el producto.' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el producto.' });
  }
};



export const obtener = async (req, res) => {
  try {
    const productos = await Product.find();
    return res.json(productos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al recuperar los productos.' });
  }
};
