import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {  
    origin: "http://localhost:3000",}
});

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use("/user", authRoutes)

 
io.on('connection', (socket) => {
  console.log(`Usuario Conectado: ${socket.id}`);

  
  socket.on('mensaje', (mensaje) => {
    console.log(`Mensaje recibido de ${socket.id}: ${mensaje}`);
    io.to(socket.id).emit('mensaje', { id: socket.id, mensaje });
  });
});


export { app, server };
