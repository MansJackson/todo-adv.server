import { Request, Response } from 'express';
import { Server, Socket } from 'socket.io';

export default (io: Server): NodeJS.EventEmitter => io.on('connection', (socket: Socket): void => {
  socket.on('disconnect', () => {

  });
});

