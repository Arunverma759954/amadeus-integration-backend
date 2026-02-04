const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const flightRoutes = require("./routes/flights.routes");
const hotelRoutes = require("./routes/hotels.routes");
const adminRoutes = require("./routes/admin.routes");

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

module.exports = app;
