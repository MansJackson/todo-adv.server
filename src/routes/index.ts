import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import {
  createList,
  createUser, emailExists, getListById, getListsByUserId, getUserByEmail, getUserById, isValidEmail, isValidUser,
} from '../util';
import { List, User, UserRequest } from '../types';

dotenv.config();
const router = express.Router();

router.get('/valid_cookie', (req: Request, res: Response) => {
  const cookie = req.cookies.juid;

  try {
    const decoded: User = jwt.verify(cookie, process.env.JWT_SECRET);
    const user = getUserById(decoded.id);
    if (!user) {
      res.status(401).json({ message: 'Invalid cookie' });
      return;
    }
    res.status(200).json({ message: 'Valid cookie' });
  } catch (err) {
    res.status(401).json({ message: 'Invalid cookie' });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (emailExists(email)) {
    res.status(409).json({ message: 'resource already exists' });
    return;
  }
  if (!isValidUser(req.body)) {
    res.status(400).json({ message: 'invalid Email' });
    return;
  }
  try {
    const hashedPW = bcrypt.hashSync(password, Number(process.env.SALT_ROUNDS));
    createUser({ ...req.body, id: uuidv4(), password: hashedPW });
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong when trying create user' });
  }
});

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);

  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
  } else {
    const valiLogin = bcrypt.compareSync(password, user.password);
    if (!valiLogin) {
      res.status(401).json({ message: 'Invalid credentials' });
    }
    res.cookie(
      'juid',
      jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET),
      { maxAge: 360000 * 24 * 7, httpOnly: false },
    );
    res.status(200).json({ message: 'User signed in succesfully' });
  }
});

router.post('/email_exists', (req: Request, res: Response) => {
  const { email } = req.body;

  if (!isValidEmail(email)) {
    res.status(400).json({ message: 'invalid Email' });
  } else if (emailExists(email)) {
    res.status(409).json({ message: 'resource already exists' });
  } else {
    res.status(200).json({ message: 'Email is available' });
  }
});

router.post('/lists', (req: UserRequest, res: Response) => {
  const { title } = req.body;
  const list: List = {
    id: uuidv4(),
    title,
    owner: req.user.id,
    editors: [],
    items: [],
  }
  createList(list);
});

router.get('/lists', (req: UserRequest, res: Response) => {
  const lists = getListsByUserId(req.user.id);
  if (!lists) {
    res.status(204).json({ message: 'No lists belong to this user' });
    return;
  }
  res.status(200).json({ lists });
});

router.get('/lists/:id', (req: UserRequest, res: Response) => {
  const { id } = req.params;
  const list = getListById(id);
  if (!list) {
    res.status(204).json({ message: 'This list does not exist' });
    return;
  }
  res.status(200).json({ list });
});

export default router;
