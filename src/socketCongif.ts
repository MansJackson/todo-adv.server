import { Server, Socket } from 'socket.io';

const timeOutLimit = 120;

export default (io: Server) => io.on('connection', (socket: Socket ) => {
  let timeSilent = 0;
  let name: string;
  let disconnectMessage: string;

  const interval = setInterval(() => {
    if (timeSilent > timeOutLimit) {
      disconnectMessage = 'was disconnected due to inactivity';
      socket.emit('timeout', { message: 'You were disconnected due to inactivity' });
      socket.disconnect();
    } else timeSilent += 1;
  }, 1000);

  socket.on('disconnect', () => {
    
  })
})