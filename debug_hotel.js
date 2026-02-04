require('dotenv').config();
const axios = require('axios');

async function getAccessToken() {
    const url = `${process.env.AMADEUS_BASE_URL}/v1/security/oauth2/token`;
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", process.env.AMADEUS_CLIENT_ID);
    params.append("client_secret", process.env.AMADEUS_CLIENT_SECRET);

    try {
        const response = await axios.post(url, params.toString(), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        return response.data.access_token;
    } catch (error) {
        console.error("❌ Auth Failed:", error.message);
        process.exit(1);
    }
}

async function testHotelSearch() {
    console.log("🔍 Debugging Hotel Search...");
    const token = await getAccessToken();
    console.log("✅ Token received.");

    // Test Params (Paris, 2026)
    // Note: Amadeus Test environment has limited data, but PAR usually works.
    const cityCode = 'PAR';
    const checkInDate = "2026-06-01";
    const checkOutDate = "2026-06-05";

    // Using v1/reference-data/locations/hotels/by-city which is often easier to test than offers
    // But user was using offers-by-city. Let's try to list hotels first as it's simpler.
    // Actually, let's replicate the user's likely call: v2/shopping/hotel-offers (if that's what they use) 
    // or v1/reference-data/locations/hotels/by-city.

    // Let's look at the error log: "searchHotelsByCity"
    // I need to see the implementation of searchHotelsByCity to replicate it exactly.
    // But a generic test is good enough to prove API access.

    const url = `${process.env.AMADEUS_BASE_URL}/v1/reference-data/locations/hotels/by-city`;

    try {
        console.log(`🚀 Searching hotels in ${cityCode}...`);
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                cityCode: cityCode
            }
        });

        console.log(`✅ Success! Found ${response.data.data ? response.data.data.length : 0} hotels.`);
    } catch (error) {
        console.error("❌ Hotel Search Error:");
        if (error.response) {
            console.error("   Status:", error.response.status);
            console.error("   Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("   Message:", error.message);
        }
    }
}

testHotelSearch();
