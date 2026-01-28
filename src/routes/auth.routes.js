const router = require("express").Router();
const { getAccessToken } = require("../services/auth.service");

router.get("/token", async (req, res, next) => {
    try {
        const token = await getAccessToken();
        res.json({ success: true, token });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
