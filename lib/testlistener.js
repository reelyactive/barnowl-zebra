/**
 * Copyright reelyActive 2025
 * We believe in an open Internet of Things
 */


const DEFAULT_RADIO_DECODINGS_PERIOD_MILLISECONDS = 1000;
const DEFAULT_RSSI = -70;
const MIN_RSSI = -80;
const MAX_RSSI = -60;
const RSSI_RANDOM_DELTA = 5;
const TEST_ORIGIN = 'test';


/**
 * TestListener Class
 * Provides a consistent stream of artificially generated packets.
 */
class TestListener {

  /**
   * TestListener constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    options = options || {};

    this.decoder = options.decoder;
    this.radioDecodingPeriod = options.radioDecodingPeriod ||
                               DEFAULT_RADIO_DECODINGS_PERIOD_MILLISECONDS;
    this.rssi = [ DEFAULT_RSSI ];
    this.eventCount = 0;
    this.decodingOptions = options.decodingOptions || {};

    setInterval(emitRadioDecodings, this.radioDecodingPeriod, this);
  }

}


/**
 * Emit simulated radio decoding packets
 * @param {TestListener} instance The given instance.
 */
function emitRadioDecodings(instance) {
  let now = new Date();
  let simulatedTagEvent = {
      type: "SIMPLE",
      timestamp: now.toISOString().replace('Z', '+0000'),
      data: {
        MAC: "C4:7D:CC:FF:FF:FF",
        antenna: 1,
        eventNum: ++instance.eventCount,
        format: "epc",
        idHex: "7EDA9038051002710002C0AE",
        peakRssi: instance.rssi[0],
        reads: 1
      }
  };

  updateSimulatedRssi(instance);
  instance.decoder.handleData(JSON.stringify(simulatedTagEvent), TEST_ORIGIN,
                              now.getTime(), instance.decodingOptions);
}


/**
 * Update the simulated RSSI values
 * @param {TestListener} instance The given instance.
 */
function updateSimulatedRssi(instance) {
  for(let index = 0; index < instance.rssi.length; index++) {
    instance.rssi[index] += Math.floor((Math.random() * RSSI_RANDOM_DELTA) -
                                       (RSSI_RANDOM_DELTA / 2));
    if(instance.rssi[index] > MAX_RSSI) {
      instance.rssi[index] = MAX_RSSI;
    }
    else if(instance.rssi[index] < MIN_RSSI) {
      instance.rssi[index] = MIN_RSSI;
    }
  }
}


module.exports = TestListener;
