require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function run() {
    const { data, error } = await supabase.from('purchases').insert([{
        user_id: '00000000-0000-0000-0000-000000000000',
        course_id: 'test',
        transaction_id: 'test',
        amount_paid: 100,
        currency: 'EGP',
        purchased_at: new Date().toISOString(),
        is_active: false,
        customer_name: 'test',
        customer_whatsapp: 'test'
    }]);
    console.log("Error:", error);
}
run();
