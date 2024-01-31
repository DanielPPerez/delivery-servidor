import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuración más específica de CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use("/user", authRoutes);

// Objeto para almacenar usuarios conectados
const connectedUsers = {};

io.on('connection', (socket) => {
  console.log(`Usuario Conectado: ${socket.id}`);

  // Manejar la conexión de un nuevo usuario
  socket.on('register', (user) => {
    if (connectedUsers[user]) {
      socket.emit('userExists');
      return;
    } else {
      console.log(`Usuario ${user} se ha unido.`);

      // Guardar la asociación entre el ID del socket y el nombre de usuario
      socket.username = user;
      connectedUsers[user] = socket.id;

      // Emitir un evento para actualizar la lista de usuarios conectados a todos los clientes
      io.emit('activeSessions', getConnectedUsers());
    }
  });

  // Manejar la desconexión de un usuario
  socket.on('disconnect', () => {
    console.log(`Usuario Desconectado: ${socket.username}`);

    // Eliminar al usuario desconectado de la lista de usuarios
    delete connectedUsers[socket.username];

    // Emitir un evento para actualizar la lista de usuarios conectados a todos los clientes
    io.emit('activeSessions', getConnectedUsers());
  });

  // Manejar los mensajes privados
  socket.on('sendMessagesPrivate', ({ selectUser, message }) => {
    const recipientSocketId = connectedUsers[selectUser];

    if (recipientSocketId) {
      // Enviar el mensaje privado al destinatario
      io.to(recipientSocketId).emit('sendMessage', { user: socket.username, message });
    } else {
      // Manejar el caso donde el destinatario no está conectado
      console.log(`Usuario ${selectUser} no está conectado.`);
    }
  });

  // Manejar los mensajes públicos
  socket.on('sendMessage', ({ message }) => {
    // Emitir el mensaje público a todos los clientes
    io.emit('sendMessage', { user: socket.username, message });
  });
});

// Función para obtener la lista de usuarios conectados
function getConnectedUsers() {
  return Object.values(connectedUsers);
}

export { app, server };
