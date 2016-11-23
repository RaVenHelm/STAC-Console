import * as net from 'net';

/**
 * StacConnection
 * A buffered client for handling the TCP connection
 * I'm indebted to: https://codedump.io/share/JidjYw6RVj1x/1/nodejs-tcp-client-communication
 */

export interface QueueMessage {
  msg: string,
  handler: (string) => void
}

export class StacConnection {
  private _socket: net.Socket;
  private _queue: QueueMessage[];
  private _message_wait: boolean;

  private _port: number;
  private _host: string;

  constructor(port: number=1025, host='localhost', callback=()=>{}) {
    this._port = port;
    this._host = host;
    this._socket = net.createConnection({port}, callback);
    this._queue = [];
    this._socket.on('data', data => {
      this._message_wait = false;
      const enqueued = this._queue.shift();
      const { handler } = enqueued;

      process.nextTick(() => {
        handler(data.toString());
      });

      this.flush();
    });

    this._socket.on('close', () => {
      this._socket.connect(this._port, 'localhost', () => console.log('Reconnecting to server'));
    });
  }

  writeMessage(msg: string, handler=(string)=>{}) {
    this._queue.push({msg, handler});
    this.flush();
  }

  flush() {
    const queuedMessage = this._queue[0];
    if(queuedMessage && !this._message_wait) {
      this._socket.write(queuedMessage.msg);
      this._message_wait = true;
    }
  }
}