const axios = require("axios");

let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
    if (cachedToken && Date.now() < tokenExpiry) {
        console.log("✅ Using cached token");
        return cachedToken;
    }

    const url = `${process.env.AMADEUS_BASE_URL}/v1/security/oauth2/token`;

    // ⚠️ Credential check
    console.log("🔍 Checking credentials...");
    console.log("   Client ID:", process.env.AMADEUS_CLIENT_ID);
    console.log("   Client Secret:", process.env.AMADEUS_CLIENT_SECRET ? "EXISTS" : "MISSING");

    if (process.env.AMADEUS_CLIENT_ID === "xxxx" || process.env.AMADEUS_CLIENT_SECRET === "xxxx") {
        throw new Error("❌ AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET are still set to 'xxxx'. Please update .env with real credentials from https://developers.amadeus.com/my-apps");
    }

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", process.env.AMADEUS_CLIENT_ID);
    params.append("client_secret", process.env.AMADEUS_CLIENT_SECRET);

    try {
        console.log("🚀 Requesting token from Amadeus...");
        const response = await axios.post(url, params.toString(), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        cachedToken = response.data.access_token;
        tokenExpiry = Date.now() + (response.data.expires_in - 30) * 1000;

        console.log("✅ Token received successfully!");
        return cachedToken;
    } catch (error) {
        console.error("❌ Amadeus API Error:");
        console.error("   Status:", error.response?.status);
        console.error("   Message:", error.response?.data);
        throw error;
    }
}

module.exports = { getAccessToken };
