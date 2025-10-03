/**
 * Copyright reelyActive 2025
 * We believe in an open Internet of Things
 */


const mqtt = require('mqtt');


const DEFAULT_URL = 'mqtt://localhost';
const DEFAULT_CLIENT_OPTIONS = {};
const DEFAULT_TOPIC = 'ziotc/#';


/**
 * MqttListener Class
 * Listens for messages as the client of a MQTT server.
 */
class MqttListener {

  /**
   * MqttListener constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    options = options || {};

    this.decoder = options.decoder;
    this.url = options.url || DEFAULT_URL;
    this.topic = options.topic || DEFAULT_TOPIC;
    this.client = createMqttClient(this, options.clientOptions);
    this.client.on('message', (topic, message) => {
      this.decoder.handleData(message.toString('utf-8'), this.url, Date.now(),
                              options.decodingOptions);
    });
  }

}


/**
 * Create the MQTT client and handle messages.
 * @param {MqttListener} instance The MqttListener instance.
 * @param {Object} clientOptions The MQTT client options.
 */
function createMqttClient(instance, clientOptions) {
  clientOptions = clientOptions || DEFAULT_CLIENT_OPTIONS;

  let client = mqtt.connect(instance.url, clientOptions);

  client.on('connect', () => {
    client.subscribe(instance.topic, (err) => {
      if(!err) {
        console.log('barnowl-zebra: connected to MQTT server and subscribed');
      }
    });
  });

  return client;
}


module.exports = MqttListener;
