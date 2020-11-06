import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ msg: 'hello world' });
});

router.post('/register', (req, res) => {

});

router.post('/login', (req, res) => {

});

export default router;