const router = require("express").Router();

const {
    searchHotelsByCity,
    getHotelOffers,
    getHotelOffersByCity,
} = require("../services/hotels.service");

// ✅ Hotel Search by City
router.post("/search", async (req, res, next) => {
    try {
        const { cityCode } = req.body;

        if (!cityCode) {
            return res.status(400).json({ success: false, message: "cityCode is required" });
        }

        const data = await searchHotelsByCity({ cityCode });
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
});

// ✅ Hotel Offers by Hotel IDs
router.post("/offers", async (req, res, next) => {
    try {
        const { hotelIds, adults = 1, checkInDate, checkOutDate } = req.body;

        if (!hotelIds || !checkInDate || !checkOutDate) {
            return res.status(400).json({
                success: false,
                message: "hotelIds, checkInDate, checkOutDate are required",
            });
        }

        const data = await getHotelOffers({
            hotelIds,
            adults,
            checkInDate,
            checkOutDate,
        });

        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
});

// ✅ ✅ BEST: Hotel Offers by City (recommended)
router.post("/offers-by-city", async (req, res, next) => {
    try {
        const { cityCode, checkInDate, checkOutDate, adults = 1 } = req.body;

        if (!cityCode || !checkInDate || !checkOutDate) {
            return res.status(400).json({
                success: false,
                message: "cityCode, checkInDate, checkOutDate are required",
            });
        }

        const data = await getHotelOffersByCity({ cityCode, checkInDate, checkOutDate, adults });

        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
