/**
 * Clear all mock/seed data from orders, bookings, and event_bookings tables.
 * Run: node clear-mock-data.js
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function clearMockData() {
    console.log('🧹 Clearing mock data from database...\n');

    // Clear orders
    const { error: ordersErr } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (ordersErr) console.error('❌ Error clearing orders:', ordersErr.message);
    else console.log('✅ Orders table cleared');

    // Clear bookings
    const { error: bookingsErr } = await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (bookingsErr) console.error('❌ Error clearing bookings:', bookingsErr.message);
    else console.log('✅ Bookings table cleared');

    // Clear event_bookings
    const { error: eventBookingsErr } = await supabase.from('event_bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (eventBookingsErr) console.error('❌ Error clearing event_bookings:', eventBookingsErr.message);
    else console.log('✅ Event bookings table cleared');

    console.log('\n🎉 Mock data cleared! Admin panel will now show only real data.');
}

clearMockData();
