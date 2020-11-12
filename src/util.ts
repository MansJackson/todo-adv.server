import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { List, User } from './types';

// Read/Write files;
export const getFile = (fileName: string): { users?: User[], lists?: List[] } => {
  try {
    const file = fs.readFileSync(path.join(__dirname, '../db', fileName)).toString();
    try {
      return JSON.parse(file);
    } catch {
      return {};
    }
  } catch (err) {
    throw new Error(`Something went wrong when trying to get ${fileName}. Does it exist?`);
  }
};

export const writeFile = (fileName: string, data: string): void => {
  try {
    fs.writeFileSync(path.join(__dirname, '../db', fileName), data);
  } catch (err) {
    throw new Error(`Something went wrong when trying to write to: ${fileName}`);
  }
};

// Validation
export const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidUser = (user: User & { passwordConf: string }): boolean => {
  if (user.name.length < 3) return false;
  if (!isValidEmail(user.email)) return false;
  if (user.password.length < 8) return false;
  if (user.passwordConf !== user.password) return false;
  return true;
};

export const emailExists = (email: string): boolean => {
  const db = getFile('users.json');
  if (!db.users) return false;
  const match = db.users.find((el) => el.email === email);
  if (match) return true;
  return false;
};

export const isListOwner = (userId: string, listId: string): boolean => {
  const db = getFile('lists.json');
  if (!db.lists) return false;
  const list = db.lists.find((el) => el.id === listId);
  if (list.owner !== userId) return false;
  return true;
};

export const isListEditor = (userId: string, listId: string): boolean => {
  const db = getFile('lists.json');
  if (!db.lists) return false;
  const list = db.lists.find((el) => el.id === listId);
  const editorIds = list.editors.map((el) => el.id);
  if (editorIds.includes(userId)) return true;
  return false;
};

// User DB
export const createUser = (user: User): void => {
  const db = getFile('users.json');
  if (db.users) db.users = [...db.users, user];
  else db.users = [user];
  writeFile('users.json', JSON.stringify(db));
};

export const getUserByEmail = (email: string): User | false => {
  const db = getFile('users.json');
  if (!db.users) return false;
  const user = db.users.find((el) => el.email === email);
  if (user) return user;
  return false;
};

export const getUserById = (id: string): User | false => {
  const db = getFile('users.json');
  if (!db.users) return false;
  const user = db.users.find((el) => el.id === id);
  if (user) return user;
  return false;
};

// List DB
export const createList = (list: List): void => {
  const db = getFile('lists.json');
  if (db.lists) db.lists = [...db.lists, list];
  else db.lists = [list];
  writeFile('lists.json', JSON.stringify(db));
};

export const getListsByUserId = (id: string): false | { owned: List[], shared: List[] } => {
  const db = getFile('lists.json');
  if (!db.lists) return false;
  const owned = db.lists.filter((el) => el.owner === id);
  const shared = db.lists.filter((el) => isListEditor(id, el.id));
  if (!owned && !shared) return false;
  return { owned, shared };
};

export const getListById = (userId: string, listId: string): false | undefined | List => {
  const db = getFile('lists.json');
  if (!db.lists) return undefined;
  const list = db.lists.find((el) => el.id === listId);
  if (!list) return undefined;
  if (list.owner !== userId && !isListEditor(userId, listId)) return false;
  return list;
};

export const addEditorToList = (listId: string, userId: string): boolean => {
  const db = getFile('lists.json');
  if (!db.lists) return false;
  const list = db.lists.find((el) => el.id === listId);
  if (!list) return false;
  const userToAdd = getUserById(userId);
  if (!userToAdd) return false;

  const newList = {
    ...list,
    editors: [
      ...list.editors,
      {
        id: userId,
        initials: userToAdd.name.split(' ')[0][0] + userToAdd.name.split(' ')[1][0],
      },
    ],
  };
  const dataToWrite = { lists: [...db.lists.filter((el) => el.id !== listId), newList] };
  writeFile('lists.json', JSON.stringify(dataToWrite));
  return true;
};

export const removeEditorFromList = (listId: string, userId: string): boolean => {
  const db = getFile('lists.json');
  if (!db.lists) return false;
  const list = db.lists.find((el) => el.id === listId);
  if (!list) return false;
  const newList = {
    ...list,
    editors: list.editors.filter((el) => el.id !== userId),
  };
  const dataToWrite = { lists: [...db.lists.filter((el) => el.id !== listId), newList] };
  writeFile('lists.json', JSON.stringify(dataToWrite));
  return true;
};

export const addItemToList = (listId: string, text: string): boolean => {
  const db = getFile('lists.json');
  if (!db.lists) return false;
  const list = db.lists.find((el) => el.id === listId);
  if (!list) return false;
  const newList = {
    ...list,
    items: [
      ...list.items,
      {
        id: uuidv4(),
        completed: false,
        text,
      },
    ],
  };
  const dataToWrite = { lists: [...db.lists.filter((el) => el.id !== listId), newList] };
  writeFile('lists.json', JSON.stringify(dataToWrite));
  return true;
};

export const deleteList = (listId: string) => {
  const db = getFile('lists.json');
  if (!db.lists) return false;
  const updatedLists = { lists: db.lists.filter((el) => el.id !== listId) };
  writeFile('lists.json', JSON.stringify(updatedLists));
  return true;
};
