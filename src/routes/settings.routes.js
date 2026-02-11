const router = require('express').Router();
const { supabase } = require('../config/supabase');

// POST /api/settings/pricing
router.post('/pricing', async (req, res, next) => {
    try {
        const { markup_value } = req.body;

        if (markup_value === undefined) {
            return res.status(400).json({ error: "Missing markup_value in body" });
        }

        console.log(`📝 [SETTINGS] Updating global markup to: ${markup_value}%`);

        // Update the pricing_settings table
        // Assuming there's only one record, we update it.
        // If multiple records, we would need an ID, but for global settings, usually one row.
        const { data, error } = await supabase
            .from('pricing_settings')
            .update({ markup_value })
            .neq('id', '00000000-0000-0000-0000-000000000000') // Update any valid row
            .select();

        if (error) {
            console.error("❌ [SUPABASE] Update failed:", error);
            return res.status(500).json({ error: error.message });
        }

        res.json({ message: "Pricing updated successfully", data });
    } catch (err) {
        next(err);
    }
});

// GET /api/settings/pricing
router.get('/pricing', async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('pricing_settings')
            .select('*')
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
