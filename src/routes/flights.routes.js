const router = require("express").Router();
const {
    searchFlights,
    priceFlight,
    getSeatMaps,
    getAncillaries,
} = require("../services/flights.service");

// GET /api/flights/search?origin=DEL&destination=BOM&departureDate=2023-10-25&adults=1
router.get("/search", async (req, res, next) => {
    try {
        const { origin, destination, departureDate, returnDate, adults } = req.query;
        if (!origin || !destination || !departureDate) {
            return res.status(400).json({ error: "Missing required query params" });
        }
        const data = await searchFlights({ origin, destination, departureDate, returnDate, adults });
        res.json(data);
    } catch (err) {
        next(err);
    }
});

// POST /api/flights/search (Support body payload)
router.post("/search", async (req, res, next) => {
    try {
        console.log("📥 [DEBUG] POST /api/flights/search - Body:", JSON.stringify(req.body, null, 2));
        const { origin, destination, departureDate, returnDate, adults } = req.body;
        if (!origin || !destination || !departureDate) {
            console.warn("⚠️ [DEBUG] Missing fields in body");
            return res.status(400).json({ error: "Missing required fields in body" });
        }
        const data = await searchFlights({ origin, destination, departureDate, returnDate, adults });
        console.log("✅ [DEBUG] Flight search successful, returning data");
        res.json(data);
    } catch (err) {
        console.error("❌ [DEBUG] Flight search failed:", err.message);
        next(err);
    }
});

// POST /api/flights/search-and-price (Composite: Search + Price First Result)
router.post("/search-and-price", async (req, res, next) => {
    try {
        const { origin, destination, departureDate, adults } = req.body;
        if (!origin || !destination || !departureDate) {
            return res.status(400).json({ error: "Missing required fields in body" });
        }

        console.log(`👉 [DEBUG] Auto-Search & Price: ${origin} -> ${destination} on ${departureDate}`);

        // 1. Search Flights
        const searchResults = await searchFlights({ origin, destination, departureDate, adults });

        if (!searchResults || !searchResults.data || searchResults.data.length === 0) {
            return res.status(404).json({ error: "No flights found for these criteria." });
        }

        // 2. Pick the first offer
        const firstOffer = searchResults.data[0];
        console.log("👉 [DEBUG] Found flight, pricing first offer ID:", firstOffer.id);

        // 3. Price the offer
        const pricingResult = await priceFlight(firstOffer);
        res.json(pricingResult);

    } catch (err) {
        next(err);
    }
});

// POST /api/flights/search-price-seatmaps (Composite: Search + Price + Seatmaps)
router.post("/search-price-seatmaps", async (req, res, next) => {
    try {
        const { origin, destination, departureDate, adults } = req.body;
        if (!origin || !destination || !departureDate) {
            return res.status(400).json({ error: "Missing required fields in body" });
        }

        console.log(`👉 [DEBUG] Auto-Search-Price-Seatmaps: ${origin} -> ${destination} on ${departureDate}`);

        // 1. Search Flights
        const searchResults = await searchFlights({ origin, destination, departureDate, adults });
        if (!searchResults || !searchResults.data || searchResults.data.length === 0) {
            return res.status(404).json({ error: "No flights found for these criteria." });
        }
        const firstOffer = searchResults.data[0];

        // 2. Price the offer
        // Note: Seatmaps usually require the RAW flight offer from search, but sometimes pricing verifies it.
        // For Amadeus seatmaps, you typically send the flight offer. 
        // Let's stick to the flow: Search -> Price -> Seatmap (using priced offer if possible, or original if pricing fails, but usually we want seatmaps for the priced confirmed option).
        // Actually, Amadeus Seatmap API documentation usually takes the 'flight-offer' object.
        // We will price it first to get the most accurate object, then ask for seatmaps.

        console.log("👉 [DEBUG] Pricing first offer:", firstOffer.id);
        const pricedOffer = await priceFlight(firstOffer);

        // 3. Get Seatmaps for the priced offer (Amadeus response wrapper behaves slightly differently, we need the FlightOffer object inside 'data' usually)
        // pricedOffer is the full response { data: { ... } } or just the data? 
        // Looking at flight.service.js: `return response.data;` so it returns the full AMADEUS envelope { data: { ... } }.
        // We need to pass the actual FlightOffer object to getSeatMaps.

        const validOfferForSeatmap = pricedOffer.data.flightOffers ? pricedOffer.data.flightOffers[0] : firstOffer;

        console.log("👉 [DEBUG] Fetching seatmaps...");
        const seatmapResult = await getSeatMaps(validOfferForSeatmap);

        res.json(seatmapResult);

    } catch (err) {
        next(err);
    }
});

// POST /api/flights/search-price-ancillaries (Composite: Search + Price + Ancillaries)
router.post("/search-price-ancillaries", async (req, res, next) => {
    try {
        const { origin, destination, departureDate, adults } = req.body;
        if (!origin || !destination || !departureDate) {
            return res.status(400).json({ error: "Missing required fields in body" });
        }

        console.log(`👉 [DEBUG] Auto-Search-Price-Ancillaries: ${origin} -> ${destination} on ${departureDate}`);

        // 1. Search Flights
        const searchResults = await searchFlights({ origin, destination, departureDate, adults });
        if (!searchResults || !searchResults.data || searchResults.data.length === 0) {
            return res.status(404).json({ error: "No flights found for these criteria." });
        }
        const firstOffer = searchResults.data[0];

        // 2. Price the offer
        console.log("👉 [DEBUG] Pricing first offer:", firstOffer.id);
        const pricedOffer = await priceFlight(firstOffer);
        const validOfferForAncillaries = pricedOffer.data.flightOffers ? pricedOffer.data.flightOffers[0] : firstOffer;

        // 3. Get Ancillaries
        console.log("👉 [DEBUG] Fetching ancillaries...");
        const ancillariesResult = await getAncillaries(validOfferForAncillaries);

        res.json(ancillariesResult);

    } catch (err) {
        next(err);
    }
});

// POST /api/flights/pricing
router.post("/pricing", async (req, res, next) => {
    try {
        console.log("👉 [DEBUG] Incoming Pricing Request Body:", JSON.stringify(req.body, null, 2));

        const { flightOffer } = req.body;
        if (!flightOffer) {
            console.error("❌ [ERROR] Missing flightOffer in request body");
            return res.status(400).json({ error: "Missing flightOffer in body" });
        }

        if (!flightOffer.travelerPricings) {
            console.error("❌ [ERROR] Missing travelerPricings in flightOffer");
            return res.status(400).json({
                error: "Invalid flightOffer: Missing 'travelerPricings'. Please ensure you are sending the complete object returned from the Search API."
            });
        }

        const data = await priceFlight(flightOffer);
        res.json(data);
    } catch (err) {
        console.error("❌ [ERROR] Pricing API Failed:");
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", JSON.stringify(err.response.data, null, 2));
        } else {
            console.error("Error Message:", err.message);
        }
        next(err);
    }
});

// POST /api/flights/seatmaps
router.post("/seatmaps", async (req, res, next) => {
    try {
        const { flightOffer } = req.body;
        if (!flightOffer) {
            return res.status(400).json({ error: "Missing flightOffer in body" });
        }
        const data = await getSeatMaps(flightOffer);
        res.json(data);
    } catch (err) {
        next(err);
    }
});

// POST /api/flights/ancillaries
router.post("/ancillaries", async (req, res, next) => {
    try {
        const { flightOffer } = req.body;
        if (!flightOffer) {
            return res.status(400).json({ error: "Missing flightOffer in body" });
        }
        const data = await getAncillaries(flightOffer);
        res.json(data);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
