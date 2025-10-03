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
    this.client = createMqttClient(this, this.url, options.clientOptions);
    this.client.on('message', (topic, message) => {
      this.decoder.handleData(message.toString('utf-8'), this.url, Date.now(),
                              options.decodingOptions);
    });
  }

}


/**
 * Create the MQTT client and handle messages.
 * @param {MqttListener} instance The MqttListener instance.
 * @param {String} url The MQTT server URL.
 * @param {Object} clientOptions The MQTT client options.
 * @param {String} topic The MQTT topic to which to subscribe.
 */
function createMqttClient(instance, url, clientOptions, topic) {
  clientOptions = clientOptions || DEFAULT_CLIENT_OPTIONS;
  topic = topic || DEFAULT_TOPIC;

  let client = mqtt.connect(instance.url, clientOptions);

  client.on('connect', () => {
    client.subscribe(topic, (err) => {
      if(!err) {
        console.log('barnowl-zebra: connected to MQTT server and subscribed');
      }
    });
  });

  return client;
}


module.exports = MqttListener;
