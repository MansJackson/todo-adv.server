import { Server, Socket } from 'socket.io';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import {
  addEditorToList,
  addItemToList,
  changeConnectedStatus,
  deleteList,
  disconnectFromAllLists,
  getListById,
  getUserByEmail,
  isListEditor,
  isListOwner,
  removeEditorFromList,
  removeItemFromList,
  toggleItemCompleted,
  updateMousePosition,
} from './util';

export default (io: Server): NodeJS.EventEmitter => (
  io.on('connection', (socket: Socket): void => {
    // @ts-ignore
    const cookies = cookie.parse(socket.handshake.query.cookie || '');
    let userId = '';
    try {
      const decoded: any = jwt.verify(cookies.juid, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch {
      socket.emit('notification', 'unauthorized');
      socket.disconnect();
      return;
    }
    socket.on('joinRoom', (id) => {
      socket.join(id);
      changeConnectedStatus(id, userId, true);
      socket.emit('isOwner', isListOwner(userId, id));
      socket.to(id).emit('updateList');
      socket.emit('updateList');
    });

    socket.on('leaveRoom', (id: string) => {
      changeConnectedStatus(id, userId, false);
      socket.leave(id);
      socket.to(id).emit('updateList');
      socket.emit('updateList');
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
      socket.to(listId).emit('updateList');
      socket.emit('updateList');
    });

    socket.on('removeEditor', (editorId: string, listId: string) => {
      if (!isListOwner(userId, listId)) {
        socket.emit('notification', 'You are not the owner of this list');
        return;
      }
      removeEditorFromList(listId, editorId);
      socket.to(listId).emit('updateList');
      socket.emit('updateList');
    });

    socket.on('addItem', (listId: string, text: string) => {
      if (!isListOwner(userId, listId) && !isListEditor(userId, listId)) {
        socket.emit('notification', 'You do not have permission to edit this list');
        return;
      }
      addItemToList(listId, text);
      socket.to(listId).emit('updateList');
      socket.emit('updateList');
    });

    socket.on('deleteItem', (listId: string, itemId: string) => {
      if (!isListOwner(userId, listId) && !isListEditor(userId, listId)) {
        socket.emit('notification', 'You do not have permission to edit this list');
        return;
      }
      removeItemFromList(listId, itemId);
      socket.to(listId).emit('updateList');
      socket.emit('updateList');
    });

    socket.on('deleteList', (listId: string) => {
      if (!isListOwner(userId, listId)) {
        socket.emit('notification', 'You do not have permission to delete this list');
        return;
      }
      const result = deleteList(listId);
      if (!result) {
        socket.emit('notification', 'Could not delete list, try again later');
      } else {
        socket.to(listId).emit('listRemoved');
        socket.emit('updateLists');
      }
    });

    socket.on('removeAsEditor', (listId: string) => {
      if (!isListEditor(userId, listId)) {
        socket.emit('notification', 'You are not listed as an editor to this file, try to refresh your page');
        return;
      }
      const result = removeEditorFromList(listId, userId);
      if (!result) {
        socket.emit('notification', 'Could not delete list, try again later');
      } else {
        socket.to(listId).emit('updateList');
        socket.emit('updateLists');
      }
    });

    socket.on('toggleCompleted', (listId, itemId) => {
      if (!isListEditor(userId, listId) && !isListOwner(userId, listId)) {
        socket.emit('notification', 'you do not have permission to edit this list');
        return;
      }
      const result = toggleItemCompleted(listId, itemId);
      if (!result) {
        socket.emit('notification', 'Could edit list, try again later');
      } else {
        socket.to(listId).emit('updateList');
        socket.emit('updateList');
      }
    });

    socket.on('changeMousePosition', (listId: string, position: { x: number, y: number }) => {
      if (!isListEditor(userId, listId) && !isListOwner(userId, listId)) {
        socket.emit('notification', 'you do not have permission to edit this list');
        return;
      }
      updateMousePosition(listId, userId, position);
      const list = getListById(userId, listId);
      socket.to(listId).emit('updateListNew', list);
      socket.emit('updateListNew', list);
    });

    socket.on('disconnect', () => {
      disconnectFromAllLists(userId);
    });
  })
);
