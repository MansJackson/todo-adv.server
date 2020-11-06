import fs from 'fs';
import path from 'path';
import { User } from './types';

export const getFile = (fileName: string) => {
  try {
    const file = fs.readFileSync(path.join(__dirname, '../', fileName)).toString();
    try {
      return JSON.parse(file);
    } catch {
      return {}
    }
  } catch (err) {
    throw new Error(`Something went wrong when trying to get ${fileName}. Does it exist?`);
  }
}

export const writeFile = (fileName: string, data: string) => {
  try {
    fs.writeFileSync(path.join(__dirname, '../', fileName), data);
  } catch (err) {
    throw new Error(`Something went wrong when trying to write to: ${fileName}`);
  }
}

export const createUser = (user: User) => {
  const db = getFile('db.json');
  try { db.users = [...db.users, user] }
  catch { db.users = [user]; }
  writeFile('db.json', JSON.stringify(db));
}