import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import {
  createUser, emailExists, getUserByEmail, isValidEmail,
} from '../util';

dotenv.config();
const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
  console.log('body', req.body); 
  const { email, password } = req.body;

  if (!isValidEmail(email)) {
    res.status(400).json({ message: 'invalid Email' });
  } else if (emailExists(email)) {
    res.status(409).json({ message: 'resource already exists' });
  } else {
    try {
      const hashedPW = bcrypt.hashSync(password, process.env.saltRounds);
      createUser({ ...req.body, id: uuidv4(), password: hashedPW });
      res.status(201).json({ message: 'User created' });
    } catch (err) {
      res.status(500).json({ message: 'Something went wrong when trying create user' });
    }
  }
});

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(email, password);
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
      { expires: new Date(Date.now() + 900000), httpOnly: true },
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

export default router;
