require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceUpdate() {
    console.log("Forcing update to 50%...");
    // Update ALL rows in the table
    const { data, error } = await supabase
        .from('pricing_settings')
        .update({ markup_value: 50 })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy condition to target all valid UUIDs

    if (error) {
        console.error("Error updating:", error);
    } else {
        console.log("Update sent. Checking result...");
    }

    // Verify
    const { data: verifyData } = await supabase
        .from('pricing_settings')
        .select('*');

    console.log("New Data:", JSON.stringify(verifyData, null, 2));
}

forceUpdate();
