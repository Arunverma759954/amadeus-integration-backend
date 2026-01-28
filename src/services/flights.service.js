const { amadeusClient } = require("../config/amadeus");
const { getAccessToken } = require("./auth.service");

/**
 * ✅ 1) FLIGHT SEARCH
 * GET /v2/shopping/flight-offers
 */
async function searchFlights({ origin, destination, departureDate, adults = 1 }) {
    const token = await getAccessToken();

    const response = await amadeusClient.get("/v2/shopping/flight-offers", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
            originLocationCode: origin,
            destinationLocationCode: destination,
            departureDate,
            adults,
            max: 10,
            currencyCode: "INR",
        },
    });

    return response.data;
}

/**
 * ✅ 2) FLIGHT PRICING
 * POST /v1/shopping/flight-offers/pricing
 */
async function priceFlight(flightOffer) {
    const token = await getAccessToken();

    const response = await amadeusClient.post(
        "/v1/shopping/flight-offers/pricing",
        {
            data: {
                type: "flight-offers-pricing",
                flightOffers: [flightOffer],
            },
        },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );

    return response.data;
}

/**
 * ✅ 3) SEAT MAPS
 * POST /v1/shopping/seatmaps
 */
async function getSeatMaps(flightOffer) {
    const token = await getAccessToken();

    const response = await amadeusClient.post(
        "/v1/shopping/seatmaps",
        {
            data: [flightOffer],
        },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );

    return response.data;
}

/**
 * ✅ 4) ANCILLARIES (BAGGAGE/MEALS)
 * POST /v1/shopping/flight-offers/upselling
 */
async function getAncillaries(flightOffer) {
    const token = await getAccessToken();

    const response = await amadeusClient.post(
        "/v1/shopping/flight-offers/upselling",
        {
            data: {
                type: "flight-offers-upselling",
                flightOffers: [flightOffer],
            },
        },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );

    return response.data;
}

module.exports = {
    searchFlights,
    priceFlight,
    getSeatMaps,
    getAncillaries,
};
