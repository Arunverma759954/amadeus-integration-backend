const { amadeusClient } = require("../config/amadeus");
const { getAccessToken } = require("./auth.service");

/**
 * ✅ 1) FLIGHT SEARCH
 * GET /v2/shopping/flight-offers
 */
async function searchFlights({ origin, destination, departureDate, returnDate, adults = 1 }) {
    try {
        const token = await getAccessToken();

        const params = {
            originLocationCode: origin,
            destinationLocationCode: destination,
            departureDate,
            adults,
            max: 10,
        };

        if (returnDate) {
            params.returnDate = returnDate;
        }

        const response = await amadeusClient.get("/v2/shopping/flight-offers", {
            headers: { Authorization: `Bearer ${token}` },
            params
        });

        // ⚠️ TEST API FIX: Randomize prices AND Convert to INR manually
        // The Amadeus Test API crashes if we ask for INR directly. So we get EUR/USD and convert it here.
        if (response.data && response.data.data) {
            response.data.data.forEach(offer => {
                if (offer.price) {
                    let currency = offer.price.currency;
                    let rate = 1;

                    // 1. Determine Conversion Rate (Approximate for Test)
                    if (currency === 'EUR') rate = 91.50; // 1 EUR = ~91.5 INR
                    if (currency === 'USD') rate = 84.50; // 1 USD = ~84.5 INR

                    // 2. Random variation for realism (-5% to +15%)
                    const variation = 1 + (Math.random() * 0.20 - 0.05);

                    // Helper to convert and format
                    const convert = (amountStr) => {
                        if (!amountStr) return null;
                        let val = parseFloat(amountStr);
                        // Apply conversion + variation
                        let final = val * rate * variation;
                        return final.toFixed(2);
                    };

                    // Update Totals
                    offer.price.total = convert(offer.price.total);

                    if (offer.price.base) {
                        offer.price.base = convert(offer.price.base);
                    }
                    if (offer.price.grandTotal) {
                        offer.price.grandTotal = convert(offer.price.grandTotal);
                    }

                    // 3. FORCE Currency Label to INR
                    offer.price.currency = 'INR';
                }
            });
        }

        console.log("✈️ [DEBUG] Processed Flights (Converted to INR):");
        response.data.data.forEach((offer, index) => {
            console.log(`   Flight #${index + 1}: ${offer.price.currency} ${offer.price.total}`);
        });

        return response.data;
    } catch (error) {
        console.error("❌ [ERROR] Amadeus Flight Search Failed:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error Message:", error.message);
        }
        throw error;
    }
}

/**
 * ✅ 2) FLIGHT PRICING
 * POST /v1/shopping/flight-offers/pricing
 */
async function priceFlight(flightOffer) {
    try {
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
    } catch (error) {
        console.error("❌ [ERROR] Amadeus Flight Pricing Failed:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error Message:", error.message);
        }
        throw error;
    }
}

/**
 * ✅ 3) SEAT MAPS
 * POST /v1/shopping/seatmaps
 */
async function getSeatMaps(flightOffer) {
    try {
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
    } catch (error) {
        console.error("❌ [ERROR] Amadeus Seatmaps Failed:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error Message:", error.message);
        }
        throw error;
    }
}

/**
 * ✅ 4) ANCILLARIES (BAGGAGE/MEALS)
 * POST /v1/shopping/flight-offers/upselling
 */
async function getAncillaries(flightOffer) {
    try {
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
    } catch (error) {
        console.error("❌ [ERROR] Amadeus Ancillaries Failed:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error Message:", error.message);
        }
        throw error;
    }
}

module.exports = {
    searchFlights,
    priceFlight,
    getSeatMaps,
    getAncillaries,
};
