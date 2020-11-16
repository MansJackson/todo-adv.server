import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import cors, { CorsOptions } from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import indexRoutes from './routes';
import authRoutes from './routes/auth';
import config from './socketConfig';
import { User } from './types';

dotenv.config();
const PORT = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);
const accessLogStream = fs.createWriteStream(path.join(__dirname, '../', 'logs', 'access.log'), { flags: 'a' });
const corsOptions: CorsOptions = {
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true,
};

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors(corsOptions));

// eslint-disable-next-line
const io = require('socket.io')(server, { cors: { ...corsOptions, cookie: true } });

config(io);

app.use(morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :url :status :response-time ms - :res[content-length]',
  { stream: accessLogStream },
));

// No auth required routes
app.use('/auth', authRoutes);

// Check if Authenticated
app.use((req: Request & { user: User }, res: Response, next: NextFunction) => {
  try {
    const cookie = req.cookies.juid;
    const decoded = jwt.verify(cookie, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

// Auth required routes
app.use('/api', indexRoutes);

const shutDown = () => {
  io.sockets.emit('shut-down', 'The server has been shut down');
  io.close(() => server.close());
  // clearUsers();
  // logToFile('server was shut down', 'connection.log');
  process.exit();
};

process.on('SIGINT', () => { shutDown(); });
process.on('SIGTERM', () => { shutDown(); });

server.listen(PORT);
