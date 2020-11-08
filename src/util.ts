import fs from 'fs';
import path from 'path';
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
}

export const getListsByUserId = (id: string): false | List[] => {
  const db = getFile('lists.json');
  if (!db.lists) return false;
  const lists = db.lists.filter(el => el.owner === id);
  return lists;
}

export const getListById = (id: string): false | List[] => {
  const db = getFile('lists.json');
  if (!db.lists) return false;
  const lists = db.lists.filter(el => el.id === id);
  return lists;
}

export const addEditorToList = (listId: string, userId: string): boolean => {
  const db = getFile('lists.json');
  if (!db.lists) return false;
  const list = db.lists.find(el => el.id === listId);
  if (!list) return false;
  const newList = { ...list, editors: [...list.editors, userId] };
  const dataToWrite = { lists: [...db.lists.filter(el => el.id !== listId), newList] };
  writeFile('list.json', JSON.stringify(dataToWrite));
}

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
  const db = getFile('db.json');
  if (!db.users) return false;
  const match = db.users.find((el) => el.email === email);
  if (match) return true;
  return false;
};
