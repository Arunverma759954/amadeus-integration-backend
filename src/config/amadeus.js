const axios = require("axios");

// Axios instance for Amadeus API
const amadeusClient = axios.create({
    baseURL: process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com",
    timeout: 30000,
});

module.exports = { amadeusClient };
