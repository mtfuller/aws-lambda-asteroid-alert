const NasaNeoClient = require('../src/nasa-neo-client');

jest.mock('https');

describe('NasaNeoClient should be able to...', () => {
    test('be configured to authenticate with the NASA NEO API.', async () => {
        const apiKey = "MY SECRET KEY";
        const hostname = "my.hostname.com";
        const port = 1234;
        const path = "my/custom/path";

        const client = new NasaNeoClient(apiKey, {
            hostname,
            port,
            path
        });

        expect(client.apiKey).toBe(apiKey);
        expect(client.hostname).toBe(hostname);
        expect(client.port).toBe(port);
        expect(client.path).toBe(path);
    });

    test('handle data from NASA NEO API.', async () => {
        const client = new NasaNeoClient("HELLO");

        const startDate = new Date(2020, 12, 1);
        const endDate = new Date(2020, 12, 31);

        const data = await client.fetchAllAsteroidsBetweenDates(startDate, endDate);

        expect(data).toHaveLength(17);

        const potentiallyDangerousNeo = data[0];
        expect(potentiallyDangerousNeo.diameter).toBe("1.03 KM");
        expect(potentiallyDangerousNeo.name).toBe("152756 (1999 JV3)");
        expect(potentiallyDangerousNeo.url).toBe("http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=2152756");
        expect(potentiallyDangerousNeo.miss_distance).toBe("24244283.99 KM");
        expect(potentiallyDangerousNeo.diameter).toBe("1.03 KM");
        expect(potentiallyDangerousNeo.isPotentiallyDangerous).toBe(true);
        
        const nonThreateningNeo = data[1];
        expect(nonThreateningNeo.name).toBe("(2018 SN3)");
        expect(nonThreateningNeo.url).toBe("http://ssd.jpl.nasa.gov/sbdb.cgi?sstr=3831170");
        expect(nonThreateningNeo.miss_distance).toBe("13556290.89 KM");
        expect(nonThreateningNeo.diameter).toBe("0.02 KM");
        expect(nonThreateningNeo.isPotentiallyDangerous).toBe(false);
    });

    test('reject non-Date arguments.', async () => {
        const client = new NasaNeoClient("HELLO");

        try {
            await client.fetchAllAsteroidsBetweenDates("2020-12-01", "2020-12-01");
        } catch (e) {
            expect(e.message).toBe("The startDate argument must be a date.");
        }

        try {
            await client.fetchAllAsteroidsBetweenDates(new Date(), "2020-12-01");
        } catch (e) {
            expect(e.message).toBe("The endDate argument must be a date.");
        }
    });
});