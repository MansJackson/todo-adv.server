import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ msg: 'hello wordl' });
});

export default router;