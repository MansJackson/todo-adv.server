import { Server, Socket } from 'socket.io';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import {
  addEditorToList, addItemToList, getUserByEmail, isListEditor, isListOwner,
} from './util';
import { User } from './types';

export default (io: Server): NodeJS.EventEmitter => (
  io.on('connection', (socket: Socket): void => {
    // @ts-ignore
    const cookies = cookie.parse(socket.request.headers.cookies || '');
    let userId = '';
    try {
      const decoded: User = jwt.verify(cookies.juid, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch {
      socket.emit('notification', 'unauthorized');
      socket.disconnect();
      return;
    }
    socket.on('joinRoom', (id) => {
      socket.join(id);
      socket.emit('notification', `Joined room: ${id}`);
    });

    socket.on('leaveRoom', (id: string) => {
      socket.leave(id);
      socket.emit('notification', `left room: ${id}`);
    });

    socket.on('addEditor', (email: string, listId: string) => {
      if (!isListOwner(userId, listId)) {
        socket.emit('notification', 'You are not the owner of this list');
        return;
      }
      const userToAdd = getUserByEmail(email);
      if (!userToAdd) {
        socket.emit('notification', 'That user does not exist');
        return;
      }
      if (isListEditor(userToAdd.id, listId)) {
        socket.emit('notification', 'That user is already an editor');
        return;
      }
      addEditorToList(listId, userToAdd.id);
      socket.emit('notification', 'User was added as an editor');
      socket.emit('updateLists');
    });

    socket.on('addItem', (listId: string, text: string) => {
      if (!isListOwner(userId, listId) && !isListEditor(userId, listId)) {
        socket.emit('notification', 'You do not have permission to edit this list');
        return;
      }
      addItemToList(listId, text);
      socket.broadcast.emit('updateList');
      socket.emit('updateList');
    });

    socket.on('disconnect', () => {
      console.log('socket disconnected');
    });
  })
);
