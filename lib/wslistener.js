/**
 * Copyright reelyActive 2025
 * We believe in an open Internet of Things
 */


const WebSocket = require('ws');


const DEFAULT_ADDRESS = 'ws://127.0.0.1/ws';


/**
 * WsListener Class
 * Listens for Zebra data via connection to a reader's Web Socket server.
 */
class WsListener {

  /**
   * WsListener constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    options = options || {};

    this.decoder = options.decoder;
    this.address = options.address || DEFAULT_ADDRESS;

    this.ws = createWebSocketClient(this);
  }

}


/**
 * Create the Web Socket client and handle events.
 * @param {WsListener} instance The WsListener instance.
 */
function createWebSocketClient(instance) {
  let ws = new WebSocket.WebSocket(instance.address);

  ws.on('open', () => {
    console.log('barnowl-zebra: WebSocket connection established');
  });
  ws.on('error', (error) => {}); // TODO: print errors?
  ws.on('close', () => {
    console.log('barnowl-zebra: WebSocket connection closed');
  });

  ws.on('message', (data) => {
    instance.decoder.handleData(data, 'WS', Date.now(),
                                instance.decodingOptions);
  });

  return ws;
}


module.exports = WsListener;
