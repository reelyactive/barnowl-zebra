/**
 * Copyright reelyActive 2025
 * We believe in an open Internet of Things
 */


const ReconnectingWebSocket = require('reconnecting-websocket');
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
  let ws = new ReconnectingWebSocket(instance.address,
                                     { WebSocket: WebSocket });

  ws.addEventListener('open', () => {
    console.log('barnowl-zebra: WebSocket connection established');
  });
  ws.addEventListener('error', () => {}); // TODO: pring errors?
  ws.addEventListener('close', () => {
    console.log('barnowl-zebra: WebSocket connection closed');
  });
  ws.addEventListener('message', (message) => {
    if(message.data instanceof Blob) {
      message.data.text().then((data) => {
        instance.decoder.handleData(data, 'WebSocket', Date.now(),
                                    instance.decodingOptions);
      });
    }
  });

  return ws;
}


module.exports = WsListener;
