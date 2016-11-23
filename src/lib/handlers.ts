import * as $ from 'jquery';
import { StacConnection } from './lib/connection';

const conn = new StacConnection();
const log = (msg:string) => console.log(msg);
const write = (msg:string) => {
  $("#output").append(`Server Reponse: ${msg}<br/>`);
};

$(() => {
  $("#submit").click(() => {
    const msg = $("#message").val();
    conn.writeMessage(msg, write);
  });
});

