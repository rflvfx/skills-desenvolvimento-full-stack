import { Server } from 'socket.io';
import http from 'http';

let io: Server;

export function initSocket(server: http.Server) {
  io = new Server(server, { cors: { origin: '*' } });
  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);
    socket.on('disconnect', () => console.log('Cliente desconectado:', socket.id));
  });
  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket nao inicializado');
  return io;
}

export function emitTransaction(userId: number, transaction: any) {
  if (io) io.emit(`transaction:${userId}`, transaction);
}
