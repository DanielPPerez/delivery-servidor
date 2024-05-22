import { Router } from "express";
import {
  login,
  logout,
  register,
  profile,
  verifyToken
} from "../controllers/auth.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { crearPedido, obtenerPedidos, borrarTodosLosPedidos, obtenerPedidoPorId} from '../controllers/pedidos.controller.js';
import { crearproducto, obtener, editarProducto, borrarProducto } from '../controllers/Product.controller.js';

const router = Router();

// Rutas relacionadas con la autenticación
router.post("/register", register);
router.post("/login", login);
router.get("/profile", auth, profile);
router.post("/logout", auth, logout);
router.get("/verify/:token", verifyToken);

// Rutas relacionadas con los pedidos
router.post('/crearpedido', crearPedido);
router.get('/obtenerpedidos', obtenerPedidos);
router.post('/crearproducto', crearproducto);
router.put('/productos/:id', editarProducto);
router.delete('/productos/:id', borrarProducto);
router.get('/obtener', obtener);
router.get('/obtenerPedido/:id', obtenerPedidoPorId);
router.delete('/borrarTodos', borrarTodosLosPedidos);

export default router;
