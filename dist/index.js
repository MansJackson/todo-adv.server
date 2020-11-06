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
var index_1 = __importDefault(require("./routes/index"));
var socketCongif_1 = __importDefault(require("./socketCongif"));
var util_1 = require("./util");
var PORT = process.env.PORT || 8000;
var app = express_1.default();
var srv = http_1.default.createServer(app);
var io = new socket_io_1.Server(srv);
var accessLogStream = fs_1.default.createWriteStream(path_1.default.join(__dirname, '../', 'logs', 'access.log'), { flags: 'a' });
socketCongif_1.default(io);
var shutDown = function () {
    io.sockets.emit('shut-down', 'The server has been shut down');
    io.close(function () { return srv.close(); });
    // clearUsers();
    // logToFile('server was shut down', 'connection.log');
    process.exit();
};
app.use(morgan_1.default(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :url :status :response-time ms - :res[content-length]', { stream: accessLogStream }));
app.get('/', function (req, res) {
    var db = util_1.getFile('db.json');
    res.status(200).send(db);
});
app.use('/api', index_1.default);
process.on('SIGINT', function () {
    shutDown();
});
process.on('SIGTERM', function () {
    shutDown();
});
srv.listen(PORT);
//# sourceMappingURL=index.js.map