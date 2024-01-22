import { Router } from "express";
import {
  login,
  logout,
  register,
 profile
} from "../controllers/auth.controller.js";
import { auth } from "../middlewares/auth.middleware.js";


const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", auth, profile);
router.post("/logout", auth,logout);


export default router;