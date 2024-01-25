import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String },
  img: { type: String },
  price: { type: Number, required: true },
  options: [
    {
      title: { type: String },
      additionalPrice: { type: Number },
    },
  ],
  quantity: { type: Number, required: true },
});

const Product = mongoose.model('Product', productSchema);

export default Product;
