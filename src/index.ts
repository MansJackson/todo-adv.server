import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import indexRoutes from './routes';
import config from './socketConfig';

const PORT = process.env.PORT || 8000;
const app = express();
const srv = http.createServer(app);
const io = new Server(srv);
const accessLogStream = fs.createWriteStream(path.join(__dirname, '../', 'logs', 'access.log'), { flags: 'a' });
const corsOptions = {
  origin: 'http://localhost:3000'
}
config(io);

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

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
