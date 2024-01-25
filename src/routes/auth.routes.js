import { Router } from "express";
import {
  login,
  logout,
  register,
  profile
} from "../controllers/auth.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { notificaciones, realizarPedido } from "../controllers/pedidos.controller.js";
import { obtener, crearproducto } from "../controllers/Product.controller.js";

const router = Router();

// Rutas relacionadas con la autenticación
router.post("/register", register);
router.post("/login", login);
router.get("/profile", auth, profile);
router.post("/logout", auth, logout);

// Rutas relacionadas con los pedidos
router.get("/notificaciones", notificaciones);
router.post("/realizar-pedido", realizarPedido);
router.post('/producto', crearproducto);
router.get('/producto', obtener);

export default router;
