"use strict";
var net = require('net');
var StacConnection = (function () {
    function StacConnection(port, host, callback) {
        var _this = this;
        if (port === void 0) { port = 1025; }
        if (host === void 0) { host = 'localhost'; }
        if (callback === void 0) { callback = function () { }; }
        this._port = port;
        this._host = host;
        this._socket = net.createConnection({ port: port }, callback);
        this._queue = [];
        this._socket.on('data', function (data) {
            _this._message_wait = false;
            var enqueued = _this._queue.shift();
            var handler = enqueued.handler;
            process.nextTick(function () {
                handler(data.toString());
            });
            _this.flush();
        });
        this._socket.on('close', function () {
            _this._socket.connect(_this._port, 'localhost', function () { return console.log('Reconnecting to server'); });
        });
    }
    StacConnection.prototype.writeMessage = function (msg, handler) {
        if (handler === void 0) { handler = function (string) { }; }
        this._queue.push({ msg: msg, handler: handler });
        this.flush();
    };
    StacConnection.prototype.flush = function () {
        var queuedMessage = this._queue[0];
        if (queuedMessage && !this._message_wait) {
            this._socket.write(queuedMessage.msg);
            this._message_wait = true;
        }
    };
    return StacConnection;
}());
exports.StacConnection = StacConnection;
