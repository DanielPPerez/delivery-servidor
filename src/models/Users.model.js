import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    trim: true
  },
  password: {
    type: String,
    required: true,
    match: /^[^\s][^\s]*$/,
  },
  nombre: {
    type: String,
    required: true,
    match: /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ]+(\s[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ]+)?$/,
    trim: true
  },
  apellido: {
    type: String,
    required: true,
    match: /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ]+(\s[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ]+)?$/,
    trim: true
  },
  telefono: {
    type: Number,
    integerOnly: true,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    trim: true
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  compras: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venta",
    },
  ],
});

export default mongoose.model("Users", userSchema);
