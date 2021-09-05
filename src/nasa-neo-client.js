const axios = require("axios");
const dateFormat = require('dateformat');

function parseNasaNeoData(data) {
    const neos = Object.keys(data).map(x => data[x])
        .reduce((a,b) => a.concat(b))
        .map(x => {
            let miss_distance = "N/A";
            if (x.hasOwnProperty("close_approach_data") && x.close_approach_data.length > 0) {
                const rawDistance = parseFloat(x.close_approach_data[0].miss_distance.kilometers);
                miss_distance = `${rawDistance.toFixed(2)} KM`
            }

            const rawDiameter = parseFloat(x.estimated_diameter.kilometers.estimated_diameter_max)
                .toFixed(2);

            const diameter = `${rawDiameter} KM`;

            return {
                name: x.name,
                url: x.nasa_jpl_url,
                miss_distance,
                diameter,
                isPotentiallyDangerous: x.is_potentially_hazardous_asteroid
            }
        });
    
    return neos;
}

class NasaNeoClient {
    constructor(apiKey, config = {}) {
        this.apiKey = apiKey;
        this.hostname = (config.hostname === undefined) ? `api.nasa.gov` : config.hostname;
        this.port = (config.port === undefined) ? 443 : config.port;
        this.path = (config.path === undefined) ? `neo/rest/v1/feed` : config.path;
    }

    async fetchAllAsteroidsBetweenDates(startDate, endDate) {
        if (!(startDate instanceof Date)) {
            throw new Error(`The startDate argument must be a date.`);
        }

        if (!(endDate instanceof Date)) {
            throw new Error(`The endDate argument must be a date.`);
        }

        let neoData;
        try {
            const requestConfig = {
                params: {
                    start_date: dateFormat(startDate, "yyyy-mm-dd"),
                    end_date: dateFormat(endDate, "yyyy-mm-dd"),
                    api_key: this.apiKey
                }
            };

            const res = await axios.get(`https://api.nasa.gov/neo/rest/v1/feed`, requestConfig);

            console.log(res.data);

            neoData = parseNasaNeoData(res.data.near_earth_objects);
        } catch (e) {
            throw new Error(`Error fetching data from NASA API: ${e}`);
        }

        return neoData;
    }
}

module.exports = NasaNeoClient;