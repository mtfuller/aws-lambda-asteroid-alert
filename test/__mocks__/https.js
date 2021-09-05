const nasaNeoResponseExample = require('../resources/nasa_neo_example.json');

const https = jest.createMockFromModule('https');

https.request = function(options, callback) {
    if (callback) {
        callback({
            on: (name, eventCallback) => eventCallback(nasaNeoResponseExample),
            statusCode: 200
        })
    }
}

module.exports = https;