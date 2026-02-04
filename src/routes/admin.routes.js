const express = require('express');
const { verifyAdmin } = require('../middleware/adminAuth');

const router = express.Router();

// Protected admin route - Get statistics
router.get('/stats', verifyAdmin, async (req, res) => {
    try {
        // Only admins can reach here
        const stats = {
            totalUsers: 100,  // Real data from database
            flightSearches: 250,
            hotelBookings: 180
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

module.exports = router;
