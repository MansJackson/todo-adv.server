"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var timeOutLimit = 120;
exports.default = (function (io) { return io.on('connection', function (socket) {
    var timeSilent = 0;
    var name;
    var disconnectMessage;
    var interval = setInterval(function () {
        if (timeSilent > timeOutLimit) {
            disconnectMessage = 'was disconnected due to inactivity';
            socket.emit('timeout', { message: 'You were disconnected due to inactivity' });
            socket.disconnect();
        }
        else
            timeSilent += 1;
    }, 1000);
    socket.on('disconnect', function () {
    });
}); });
//# sourceMappingURL=socketCongif.js.map