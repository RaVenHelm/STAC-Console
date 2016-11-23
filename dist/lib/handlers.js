"use strict";
var $ = require('jquery');
var connection_1 = require('./lib/connection');
var conn = new connection_1.StacConnection();
var log = function (msg) { return console.log(msg); };
var write = function (msg) {
    $("#output").append("Server Reponse: " + msg + "<br/>");
};
$(function () {
    $("#submit").click(function () {
        var msg = $("#message").val();
        conn.writeMessage(msg, write);
    });
});
