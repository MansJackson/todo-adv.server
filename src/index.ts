import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import cors, { CorsOptions } from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import indexRoutes from './routes';
import config from './socketConfig';
import { User } from './types';

const PORT = process.env.PORT || 8000;
const app = express();
const srv = http.createServer(app);
const io = new Server(srv);
const accessLogStream = fs.createWriteStream(path.join(__dirname, '../', 'logs', 'access.log'), { flags: 'a' });
const corsOptions: CorsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
config(io);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors(corsOptions));

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

const shutDown = () => {
  io.sockets.emit('shut-down', 'The server has been shut down');
  io.close(() => srv.close());
  // clearUsers();
  // logToFile('server was shut down', 'connection.log');
  process.exit();
};

app.use(morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :url :status :response-time ms - :res[content-length]',
  { stream: accessLogStream },
));

app.use('/api', indexRoutes);

process.on('SIGINT', () => {
  shutDown();
});

process.on('SIGTERM', () => {
  shutDown();
});

srv.listen(PORT);
