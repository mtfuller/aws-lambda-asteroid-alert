const nasaNeoResponseExample = require('../resources/nasa_neo_example.json');

const axios = jest.createMockFromModule('axios');

axios.get = async function(url, config) {
    return nasaNeoResponseExample; 
}

module.exports = axios;