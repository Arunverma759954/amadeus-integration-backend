require('dotenv').config();
const axios = require('axios');

async function testAuth() {
    console.log("🔍 Debugging Amadeus Auth...");
    console.log("   Base URL:", process.env.AMADEUS_BASE_URL);
    console.log("   Client ID:", process.env.AMADEUS_CLIENT_ID);
    console.log("   Client Secret:", process.env.AMADEUS_CLIENT_SECRET ? "Has Value" : "Missing");

    const url = `${process.env.AMADEUS_BASE_URL}/v1/security/oauth2/token`;
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", process.env.AMADEUS_CLIENT_ID);
    params.append("client_secret", process.env.AMADEUS_CLIENT_SECRET);

    try {
        console.log(`🚀 Sending POST request to ${url}...`);
        const response = await axios.post(url, params.toString(), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        console.log("✅ Success! Token received.");
        console.log("   Access Token:", response.data.access_token ? "Yes" : "No");
    } catch (error) {
        console.error("❌ Error Requesting Token:");
        if (error.response) {
            console.error("   Status:", error.response.status);
            console.error("   Data:", JSON.stringify(error.response.data, null, 2));
            console.error("   Headers:", JSON.stringify(error.response.headers, null, 2));
        } else {
            console.error("   Message:", error.message);
        }
    }
}

testAuth();
