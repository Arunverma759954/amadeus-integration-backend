require('dotenv').config();
const axios = require('axios');

async function testAmadeus() {
    try {
        const url = 'https://test.api.amadeus.com/v1/security/oauth2/token';
        const params = new URLSearchParams();

        params.append('grant_type', 'client_credentials');
        params.append('client_id', process.env.AMADEUS_CLIENT_ID);
        params.append('client_secret', process.env.AMADEUS_CLIENT_SECRET);

        console.log('🚀 Testing Amadeus Token...');

        const response = await axios.post(url, params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        console.log('✅ Success! Token received.');
        console.log('Access Token:', response.data.access_token.substring(0, 10) + '...');
    } catch (error) {
        console.log('❌ Failed!');
        console.log('Status:', error.response?.status);
        console.log('Data:', error.response?.data);

        if (error.response?.status === 500) {
            console.log('⚠️ Amadeus Server error (500).');
        }
    }
}

testAmadeus();
