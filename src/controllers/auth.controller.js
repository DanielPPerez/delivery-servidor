import User from "../models/Users.model.js";
import sanitizeHtml from "sanitize-html";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { TOKEN_SECRET } from "../config.js";
import { createAccessToken } from "../libs/jwt.js";

const PrimerLetraMayus = (string) => {
    const palabras = string.trim().toLowerCase().split(" ");
    const palabrasMayusculas = palabras.map(
      (palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1)
    );
    return palabrasMayusculas.join(" ");
  };

export const register = async (req, res) => {
    try {
      const { email, password, telefono } = req.body;
  
      const userFound = await User.findOne({ email });
  
      if (userFound)
        return res.status(400).json({
          message: ["El email ya esta en uso"],
        });

        const isAdmin =
        email === "admin@example.com" && password === "adminPassword";
  
      // hashing the password
      const passwordHash = await bcrypt.hash(password, 10);
  
      // creating the user
      const newUser = new User({
      email: sanitizeHtml(email.toLowerCase()),
      password: passwordHash,
      telefono: sanitizeHtml(telefono),
      isAdmin: isAdmin,
      });
  
      // saving the user in the database
      const userSaved = await newUser.save();
  
      // create access token
      const token = await createAccessToken({
        id: userSaved._id,
      });
  
      res.cookie("token", token, {
        httpOnly: process.env.NODE_ENV !== "development",
        secure: true,
        sameSite: "none",
      });
  
      res.json({
        id: userSaved._id,
        nombre: userSaved.nombre,
        email: userSaved.email,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  export const login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const userFound = await User.findOne({ email });
  
      if (!userFound)
        return res.status(400).json({
          message: ["El email no existe"],
        });
  
      const isMatch = await bcrypt.compare(password, userFound.password);
      if (!isMatch) {
        return res.status(400).json({
          message: ["La contraseña es incorrecta"],
        });
      }
  
      // Aquí maneja la redirección según si el usuario es administrador o no
      let redirectPath = userFound.isAdmin ? '/admin' : '/';
      
      const token = await createAccessToken({
        id: userFound._id,
        email: userFound.email,
      });
  
      res.cookie("token", token).json({ redirectPath });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
  
  

  export const verifyToken = async (req, res) => {
    const { token } = req.cookies;
    if (!token) return res.send(false);
  
    jwt.verify(token, TOKEN_SECRET, async (error, user) => {
      if (error) return res.sendStatus(401);
  
      const userFound = await User.findById(user.id);
      if (!userFound) return res.sendStatus(401);
  
      return res.json({
        id: userFound._id,
        username: userFound.username,
        email: userFound.email,
      });
    });
  };
  
  export const logout = async (req, res) => {
    res.cookie("token", "", {
      httpOnly: true,
      secure: true,
      expires: new Date(0),
    });
    return res.sendStatus(200);
  };

  export const profile = async (req, res) => {
  
   const userFound =  await User.findById(req.user.id)

   if (!userFound) return res.status(400).json ({message: "usuario no encontrado"});
   return res.json({
     email: userFound.email,
     telefono: userFound.telefono,
   })
  
  }