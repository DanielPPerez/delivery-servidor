import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use('/user', authRoutes);

// Configuración de Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected');

  // Manejar mensajes del cliente al servidor
  socket.on('chat message', (msg) => {
    console.log(`Message from ${socket.id}: ${msg}`);
    // Aquí puedes procesar el mensaje como lo necesites y enviarlo a otros usuarios
    io.emit('chat message', { id: socket.id, message: msg });
  });

  // Manejar eventos adicionales según tus necesidades
  // ...

  // Manejar desconexiones de usuarios
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

export { app, server };
