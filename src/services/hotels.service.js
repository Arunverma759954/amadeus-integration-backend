const { amadeusClient } = require("../config/amadeus");
const { getAccessToken } = require("./auth.service");

// ✅ Hotel list by city
async function searchHotelsByCity({ cityCode }) {
    try {
        const token = await getAccessToken();

        const response = await amadeusClient.get(
            "/v1/reference-data/locations/hotels/by-city",
            {
                headers: { Authorization: `Bearer ${token}` },
                params: { cityCode },
            }
        );

        return response.data;
    } catch (error) {
        console.log("\n❌ Hotel API Error (searchHotelsByCity)");
        console.log("Status:", error?.response?.status);
        console.log("Error Details:", error?.response?.data);
        throw error;
    }
}

// ✅ Hotel offers by hotelIds
async function getHotelOffers({ hotelIds, adults = 1, checkInDate, checkOutDate }) {
    const params = {
        hotelIds,
        adults,
        checkInDate,
        checkOutDate,
        currency: "INR",
    };

    try {
        const token = await getAccessToken();

        const response = await amadeusClient.get("/v3/shopping/hotel-offers", {
            headers: { Authorization: `Bearer ${token}` },
            params,
        });

        return response.data;
    } catch (error) {
        console.log("\n❌ Hotel API Error (getHotelOffers)");
        console.log("Status:", error?.response?.status);
        console.log("Error Details:", error?.response?.data);
        console.log("Request Params:", params);
        throw error;
    }
}

// ✅ ⭐ BEST: Hotel offers by cityCode (Auto-fetches hotel IDs first)
async function getHotelOffersByCity({ cityCode, checkInDate, checkOutDate, adults = 1 }) {
    try {
        // Step 1: Get hotel IDs for the city
        console.log(`\n🔍 Step 1: Fetching hotels in ${cityCode}...`);
        const hotelsData = await searchHotelsByCity({ cityCode });

        if (!hotelsData?.data || hotelsData.data.length === 0) {
            throw new Error(`No hotels found for city code: ${cityCode}`);
        }

        // Extract hotel IDs (limit to first 10 for performance)
        const hotelIds = hotelsData.data
            .slice(0, 10)
            .map(hotel => hotel.hotelId)
            .join(',');

        console.log(`✅ Found ${hotelsData.data.length} hotels, fetching offers for first 10...`);

        // Step 2: Get offers for those hotel IDs
        const offersData = await getHotelOffers({
            hotelIds,
            adults,
            checkInDate,
            checkOutDate,
        });

        console.log(`✅ Successfully retrieved hotel offers for ${cityCode}`);
        return offersData;
    } catch (error) {
        console.log("\n❌ Hotel API Error (getHotelOffersByCity)");
        console.log("Status:", error?.response?.status);
        console.log("Error Details:", error?.response?.data || error.message);
        console.log("Request Params:", { cityCode, checkInDate, checkOutDate, adults });
        throw error;
    }
}

module.exports = {
    searchHotelsByCity,
    getHotelOffers,
    getHotelOffersByCity,
};
