"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var http_1 = __importDefault(require("http"));
var socket_io_1 = require("socket.io");
var morgan_1 = __importDefault(require("morgan"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var cors_1 = __importDefault(require("cors"));
var body_parser_1 = __importDefault(require("body-parser"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var routes_1 = __importDefault(require("./routes"));
var socketConfig_1 = __importDefault(require("./socketConfig"));
var PORT = process.env.PORT || 8000;
var app = express_1.default();
var srv = http_1.default.createServer(app);
var io = new socket_io_1.Server(srv);
var accessLogStream = fs_1.default.createWriteStream(path_1.default.join(__dirname, '../', 'logs', 'access.log'), { flags: 'a' });
var corsOptions = {
    origin: 'http://localhost:3000'
};
socketConfig_1.default(io);
app.use(cors_1.default(corsOptions));
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use(cookie_parser_1.default());
var shutDown = function () {
    io.sockets.emit('shut-down', 'The server has been shut down');
    io.close(function () { return srv.close(); });
    // clearUsers();
    // logToFile('server was shut down', 'connection.log');
    process.exit();
};
app.use(morgan_1.default(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :url :status :response-time ms - :res[content-length]', { stream: accessLogStream }));
app.use('/api', routes_1.default);
process.on('SIGINT', function () {
    shutDown();
});
process.on('SIGTERM', function () {
    shutDown();
});
srv.listen(PORT);
//# sourceMappingURL=index.js.map