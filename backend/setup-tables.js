const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: ['.env.local', '.env'] });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const sql = `
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    is_veg BOOLEAN DEFAULT true,
    available BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS allow_all_menu ON menu_items;
CREATE POLICY allow_all_menu ON menu_items FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    items JSONB NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    payment_method TEXT DEFAULT 'cod',
    payment_status TEXT DEFAULT 'pending',
    order_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS allow_all_orders ON orders;
CREATE POLICY allow_all_orders ON orders FOR ALL USING (true) WITH CHECK (true);
`;

async function main() {
    console.log('Creating tables via SQL...');
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
        console.log('RPC error (expected if exec_sql not available):', error.message);
        console.log('\nPlease run this SQL manually in Supabase SQL Editor:\n');
        console.log(sql);
        console.log('\nTrying to check if tables already exist...');

        const { error: e1 } = await supabase.from('menu_items').select('id').limit(1);
        console.log('menu_items:', e1 ? 'NOT FOUND - ' + e1.message : 'EXISTS');

        const { error: e2 } = await supabase.from('orders').select('id').limit(1);
        console.log('orders:', e2 ? 'NOT FOUND - ' + e2.message : 'EXISTS');
    } else {
        console.log('Tables created successfully!');
    }
}

main();
