import express, { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  createList,
  getInitials,
  getListById, getListsByUserId,
} from '../util';
import { List, AuthenticatedReq } from '../types';

const router = express.Router();

router.get('/me', (req: AuthenticatedReq, res: Response) => {
  res.status(200).json(req.user.id);
})

router.post('/lists', (req: AuthenticatedReq, res: Response) => {
  const { title } = req.body;
  const list: List = {
    id: uuidv4(),
    title: title[0].toUpperCase() + title.substring(1),
    owner: {
      id: req.user.id,
      initials: getInitials(req.user.name),
      connected: false,
      mousePosition: { x: 0, y: 0 },
    },
    editors: [],
    items: [],
  };
  createList(list);
  res.status(201).json({ message: 'list was created' });
});

router.get('/lists', (req: AuthenticatedReq, res: Response) => {
  const lists = getListsByUserId(req.user.id);
  if (!lists) {
    res.status(204).json({ message: 'No lists belong to this user' });
    return;
  }
  const { owned, shared } = lists;
  res.status(200).json({ owned, shared });
});

router.get('/lists/:id', (req: AuthenticatedReq, res: Response) => {
  const userId = req.user.id;
  const { id } = req.params;
  const list = getListById(userId, id);
  if (list === undefined) {
    res.status(204).json({ message: 'This list does not exist' });
    return;
  } if (list === false) {
    res.status(401).json({ message: 'You do not have permission to view this list' });
    return;
  }
  res.status(200).json({ list });
});

export default router;
