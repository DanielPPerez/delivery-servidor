import { Router } from "express";
import {
  login,
  logout,
  register,
  profile,
  verifyToken
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
router.get("/verify", verifyToken);

// Rutas relacionadas con los pedidos
router.get("/notificaciones", notificaciones);
router.post("/realizar-pedido", realizarPedido);
router.post('/crearproducto', crearproducto);
router.get('/obtener', obtener);

export default router;
