require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPricing() {
    console.log("Checking 'pricing_settings' table...");
    const { data, error } = await supabase
        .from('pricing_settings')
        .select('*');

    if (error) {
        console.error("Error fetching data:", error);
    } else {
        console.log("Data in 'pricing_settings':", JSON.stringify(data, null, 2));
    }
}

checkPricing();
