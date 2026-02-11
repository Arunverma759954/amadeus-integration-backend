const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const flightRoutes = require("./routes/flights.routes");
const hotelRoutes = require("./routes/hotels.routes");
const adminRoutes = require("./routes/admin.routes");
const settingsRoutes = require("./routes/settings.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.json({ status: "OK", message: "Amadeus Backend Running ✅" });
});

// ✅ Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingsRoutes);

// ✅ Global Error Handler
app.use((err, req, res, next) => {
    console.error("❌ [GLOBAL ERROR HANDLER]:", err.message);

    // Amadeus errors often have a response object with more details
    const status = err.response?.status || 500;
    const data = err.response?.data || { error: err.message };

    // Log the full detail of the error for our debugging
    if (err.response) {
        console.log("🔍 [ERROR DETAIL] Amadeus Response:", JSON.stringify(data, null, 2));
    }

    res.status(status).json(data);
});

module.exports = app;
