require("dotenv").config();
const app = require("./app");

// ✅ Debug: env check
console.log("✅ PORT =>", process.env.PORT);
console.log("✅ AMADEUS_BASE_URL =>", process.env.AMADEUS_BASE_URL);
console.log("✅ AMADEUS_CLIENT_ID =>", process.env.AMADEUS_CLIENT_ID ? "LOADED ✅" : "MISSING ❌");
console.log("✅ AMADEUS_CLIENT_SECRET =>", process.env.AMADEUS_CLIENT_SECRET ? "LOADED ✅" : "MISSING ❌");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
