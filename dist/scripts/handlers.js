"use strict";
var connection_1 = require('./lib/connection');
var conn = new connection_1.StacConnection();
var log = function (msg) { return console.log(msg); };
conn.writeMessage('HRBT', log);
conn.writeMessage("LOGA \"ejohn\" \"rocketman\"", log);
conn.writeMessage("LOGO", log);
