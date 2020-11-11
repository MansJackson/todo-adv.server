import { Server, Socket } from 'socket.io';

export default (io: Server): NodeJS.EventEmitter => (
  io.on('connection', (socket: Socket): void => {
    socket.on('joinRoom', (id) => {
      socket.join(id);
      socket.emit('notification', `Joined room: ${id}`);
    });

    socket.on('leaveRoom', (id) => {
      socket.leave(id);
      socket.emit('notification', `left room: ${id}`);
    })

    socket.on('disconnect', () => {
      console.log('socket disconnected');
    });
  })
);
