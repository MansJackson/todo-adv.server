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
  const user = db.users.find((el) => el.email === email);
  if (user) return user;
  return false;
};

export const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const emailExists = (email: string): boolean => {
  const db = getFile('db.json');
  const match = db.users.find((el) => el.email === email);
  if (match) return true;
  return false;
};
