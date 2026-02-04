const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Admin verification middleware
const verifyAdmin = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                error: 'No authorization token provided'
            });
        }

        // Verify token and get user
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                error: 'Invalid or expired token'
            });
        }

        // Check if user is admin
        // We check for both is_admin flag in metadata AND the specific admin email as a fallback
        const isAdmin = user.user_metadata?.is_admin === true || user.email === 'arunverma759954@gmail.com';

        if (!isAdmin) {
            return res.status(403).json({
                error: 'Access denied. Admin privileges required.'
            });
        }

        // Add user to request object for use in route handlers
        req.user = user;
        next();

    } catch (error) {
        console.error('Admin verification error:', error);
        return res.status(500).json({
            error: 'Internal server error during authentication'
        });
    }
};

module.exports = { verifyAdmin };
