import express, { Request, Response } from 'express';
import http from 'http'
import { Server } from 'socket.io'
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import indexRoutes from './routes/index';
import config from './socketCongif';

const PORT = process.env.PORT || 8000;
const app = express();
const srv = http.createServer(app);
const io = new Server(srv);
const accessLogStream = fs.createWriteStream(path.join(__dirname, '../', 'logs', 'access.log'), { flags: 'a' });
config(io);

const shutDown = () => {
  io.sockets.emit('shut-down', 'The server has been shut down');
  io.close();
  srv.close();
  // clearUsers();
  // logToFile('server was shut down', 'connection.log');
  process.exit();
};

app.use(express.static(path.join(__dirname, '../build')));
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