import fs from 'fs';
import path from 'path';
import { User } from './types';

export const getFile = (fileName: string): { users?: User[] } => {
  try {
    const file = fs.readFileSync(path.join(__dirname, '../', fileName)).toString();
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
    fs.writeFileSync(path.join(__dirname, '../', fileName), data);
  } catch (err) {
    throw new Error(`Something went wrong when trying to write to: ${fileName}`);
  }
};

export const createUser = (user: User): void => {
  const db = getFile('db.json');
  try { db.users = [...db.users, user]; } catch { db.users = [user]; }
  writeFile('db.json', JSON.stringify(db));
};

export const getUserByEmail = (email: string): User | false => {
  const db = getFile('db.json');
  if (!db.users) return false;
  const user = db.users.find((el) => el.email === email);
  if (user) return user;
  return false;
};

export const getUserById = (id: string): User | false => {
  const db = getFile('db.json');
  if (!db.users) return false;
  const user = db.users.find((el) => el.id === id);
  if (user) return user;
  return false;
};

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
