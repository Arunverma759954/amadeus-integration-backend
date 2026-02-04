require("dotenv").config();
const { searchFlights } = require("./src/services/flights.service");

async function test() {
    try {
        console.log("Testing search...");
        const results = await searchFlights({
            origin: "DEL",
            destination: "BOM",
            departureDate: "2026-02-15",
            adults: 1
        });
        console.log("Success! Found", results.data?.length, "flights");
    } catch (err) {
        console.error("Error during search:");
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", JSON.stringify(err.response.data, null, 2));
        } else {
            console.error(err.message);
        }
    }
}

test();
