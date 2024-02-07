import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true,
  },
  desc: String,
  img: {
    type: Buffer,  
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model('Product', productSchema);

export default Product;
