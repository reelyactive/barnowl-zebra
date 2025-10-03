/**
 * Copyright reelyActive 2025
 * We believe in an open Internet of Things
 */


const Raddec = require('raddec');


/**
 * ZebraDecoder Class
 * Decodes data streams from one or more Zebra readers and forwards the
 * packets to the given BarnowlZebra instance.
 */
class ZebraDecoder {

  /**
   * ZebraDecoder constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    options = options || {};

    this.barnowl = options.barnowl;
  }

  /**
   * Handle data from a given device, specified by the origin
   * @param {Buffer} data The data as a buffer.
   * @param {String} origin The unique origin identifier of the device.
   * @param {Number} time The time of the data capture.
   * @param {Object} decodingOptions The packet decoding options.
   */
  handleData(data, origin, time, decodingOptions) {
    let self = this;
    let raddecs = [];

    if(data) {
      raddecs = processIoTConnectorData(data, origin, time, decodingOptions);
    }

    raddecs.forEach((raddec) => {
      self.barnowl.handleRaddec(raddec);
    });
  }
}


/**
 * Process IoT Connector data
 * @param {Buffer} data The data as a buffer.
 * @param {String} origin The unique origin identifier of the device.
 * @param {Number} time The time of the data capture.
 * @param {Object} decodingOptions The packet decoding options.
 */
function processIoTConnectorData(data, origin, time, decodingOptions) {
  let raddecs = [];
  let tagDataEvents = extractTagDataEvents(data);

  tagDataEvents.forEach((tagDataEvent) => {
    let hasIdHex = tagDataEvent.data?.hasOwnProperty('idHex');

    if(hasIdHex) {
      let transmitterId = tagDataEvent.data.idHex.toLowerCase();
      let transmitterIdType = Raddec.identifiers.TYPE_UNKNOWN;
 
      if((tagDataEvent.data?.format === 'epc') &&
         ((transmitterId.length / 2) ===
          Raddec.identifiers.lengthInBytes(Raddec.identifiers.TYPE_EPC96))) {
        transmitterIdType = Raddec.identifiers.TYPE_EPC96;
      }
      // TODO: tid?

      let raddec = new Raddec({
          transmitterId: transmitterId,
          transmitterIdType: transmitterIdType,
          timestamp: new Date(tagDataEvent.timestamp).getTime()
      });

      let hasMac = tagDataEvent.data?.hasOwnProperty('MAC');
      let hasAntenna = tagDataEvent.data?.hasOwnProperty('antenna');
      let hasPeakRssi = tagDataEvent.data?.hasOwnProperty('peakRssi');

      if(hasMac && hasAntenna && hasPeakRssi) {
        let receiverId = tagDataEvent.data.MAC.toLowerCase().replaceAll(':','');
        raddec.addDecoding({
            receiverId: receiverId,
            receiverIdType: Raddec.identifiers.TYPE_EUI48,
            receiverAntenna: tagDataEvent.data.antenna,
            rssi: tagDataEvent.data.peakRssi
        });

        if(tagDataEvent.data?.reads && (tagDataEvent.data.reads > 1)) {
          raddec.rssiSignature[0].numberOfDecodings = tagDataEvent.data.reads;
        }
      }

      raddecs.push(raddec);
    }
  });

  return raddecs;
}


/**
 * Extract the individual tag data events from the given data buffer
 * Note: each chunk of data contains one or more JSON strings, however,
 *       together these are not valid JSON, nor are they separated by a
 *       delimiter, and must therefore be (awkwardly) reconstructed
 * @param {Buffer} data The data as a buffer.
 * @param {String} origin The unique origin identifier of the device.
 * @param {Number} time The time of the data capture.
 * @param {Object} decodingOptions The packet decoding options.
 */
function extractTagDataEvents(data) {
  let tagDataEvents = [];
  let jsonStrings = data.toString('utf-8').split('}{');
  let numberOfEvents = jsonStrings.length;

  // If there are multiple JSON strings, curly braces must be reinserted
  if(numberOfEvents > 1) {
    jsonStrings[0] += '}';

    for(let index = 1; index < (numberOfEvents - 1); index++) {
      jsonStrings[index] = '{' + jsonStrings[index] + '}';
    }

    jsonStrings[numberOfEvents - 1] = '{' + jsonStrings[numberOfEvents - 1];
  }

  jsonStrings.forEach((jsonString) => {
    try {
      tagDataEvents.push(JSON.parse(jsonString));
    }
    catch(error) {}
  });

  return tagDataEvents;
}


module.exports = ZebraDecoder;
