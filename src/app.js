import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import { shortPollingRouter, notificationRouter } from './controllers/pedidos.controller.js';

const app = express();
const server = http.createServer(app);
const socketServer = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Update this based on your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(cors()); // Add CORS middleware
app.use('/shortpolling', shortPollingRouter);
app.use('/notifications', notificationRouter);
app.use("/user", authRoutes);

let connectedUsers = 0;
let activeSockets = []; // Store connected sockets

socketServer.on('connection', (socket) => {
  console.log('A client has connected');
  connectedUsers++;
  activeSockets.push(socket); // Add socket to active sockets array
  socket.emit('connected_users', { count: connectedUsers });

  socket.on('disconnect', () => {
    connectedUsers--;
    activeSockets = activeSockets.filter((activeSocket) => activeSocket !== socket);
  });

  socket.on('chat_message', (data) => {
    // Broadcast the message to all connected sockets except the sender
    socket.broadcast.emit('chat_message', data);
  });

  socket.on('get_connected_users', () => {
    // Send connected users count only to the sender
    socket.emit('connected_users', { count: connectedUsers });
  });

  socket.on('private_message', (data) => {
    // Send a private message to a specific user (identified by socket ID)
    const { recipientSocketId, message } = data;
    const recipientSocket = activeSockets.find((socket) => socket.id === recipientSocketId);

    if (recipientSocket) {
      recipientSocket.emit('private_message', { senderSocketId: socket.id, message });
    }
  });
});

const pollConnectedUsers = () => {
  const data = { count: connectedUsers };

  // Send connected users count to all connected sockets
  activeSockets.forEach((socket) => {
    socket.emit('connected_users', data);
  });

  setTimeout(pollConnectedUsers, 5000);
};

pollConnectedUsers();

export { app, server };
