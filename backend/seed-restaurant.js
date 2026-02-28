const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function ensureTable(name, createFn) {
    const { data, error } = await supabase.from(name).select('id').limit(1);
    if (error && error.code === '42P01') {
        console.log(`Table ${name} does not exist, creating...`);
        await createFn();
    }
}

async function seedMenuItems() {
    console.log('Seeding menu items...');

    // Delete existing
    await supabase.from('menu_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const items = [
        // Starters
        { name: 'Paneer Tikka', description: 'Tandoori-grilled cottage cheese cubes marinated in spiced yogurt', price: 220, category: 'Starters', image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400', is_veg: true, available: true, sort_order: 1 },
        { name: 'Chicken Tikka', description: 'Smoky char-grilled chicken pieces in aromatic tandoori marinade', price: 240, category: 'Starters', image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400', is_veg: false, available: true, sort_order: 2 },
        { name: 'Tandoori Kebab', description: 'Skewered minced lamb kebabs with fresh herbs and spices', price: 260, category: 'Starters', image_url: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400', is_veg: false, available: true, sort_order: 3 },
        { name: 'Masala Papad', description: 'Crispy papad topped with onion, tomato, and spice mix', price: 80, category: 'Starters', image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', is_veg: true, available: true, sort_order: 4 },
        { name: 'Hot & Sour Veg Soup', description: 'Tangy and spicy mixed vegetable soup', price: 120, category: 'Soups', image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', is_veg: true, available: true, sort_order: 5 },

        // Main Course Veg
        { name: 'Paneer Butter Masala', description: 'Soft paneer cubes in rich creamy tomato-butter gravy', price: 240, category: 'Main Course (Veg)', image_url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400', is_veg: true, available: true, sort_order: 10 },
        { name: 'Shahi Paneer', description: 'Royal paneer in cashew-cream sauce with aromatic spices', price: 250, category: 'Main Course (Veg)', image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400', is_veg: true, available: true, sort_order: 11 },
        { name: 'Paneer Tawa Masala', description: 'Paneer cubes tossed on a hot tawa with bell peppers and onions', price: 230, category: 'Main Course (Veg)', image_url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400', is_veg: true, available: true, sort_order: 12 },
        { name: 'Veg Kolhapuri', description: 'Spicy mixed vegetables in fiery Kolhapuri masala', price: 200, category: 'Main Course (Veg)', image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400', is_veg: true, available: true, sort_order: 13 },
        { name: 'Navratna Khorma', description: 'Nine-jewel vegetable korma in mild cashew-cream sauce', price: 220, category: 'Main Course (Veg)', image_url: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400', is_veg: true, available: true, sort_order: 14 },
        { name: 'Veg Jalfrezi', description: 'Stir-fried vegetables in tangy tomato-pepper sauce', price: 200, category: 'Main Course (Veg)', image_url: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400', is_veg: true, available: true, sort_order: 15 },

        // Main Course Non-Veg
        { name: 'Butter Chicken', description: 'Tender chicken in rich, creamy tomato-butter gravy', price: 280, category: 'Main Course (Non-Veg)', image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400', is_veg: false, available: true, sort_order: 20 },
        { name: 'Chicken Handi', description: 'Slow-cooked chicken in an earthy clay pot with aromatic spices', price: 270, category: 'Main Course (Non-Veg)', image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', is_veg: false, available: true, sort_order: 21 },
        { name: 'Chicken Kolhapuri', description: 'Fiery chicken curry with Kolhapuri red chili masala', price: 260, category: 'Main Course (Non-Veg)', image_url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400', is_veg: false, available: true, sort_order: 22 },
        { name: 'Chicken Rogan Josh', description: 'Kashmiri-style aromatic chicken curry', price: 280, category: 'Main Course (Non-Veg)', image_url: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=400', is_veg: false, available: true, sort_order: 23 },

        // Biryani
        { name: 'Veg Biryani', description: 'Fragrant basmati rice layered with spiced vegetables', price: 200, category: 'Biryani', image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', is_veg: true, available: true, sort_order: 30 },
        { name: 'Chicken Biryani', description: 'Aromatic basmati rice layered with spiced chicken and saffron', price: 250, category: 'Biryani', image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', is_veg: false, available: true, sort_order: 31 },
        { name: 'Paneer Tikka Biryani', description: 'Smoky paneer tikka mixed with fragrant biryani rice', price: 230, category: 'Biryani', image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', is_veg: true, available: true, sort_order: 32 },

        // Breads
        { name: 'Tandoori Roti', description: 'Whole wheat bread baked in tandoor', price: 30, category: 'Breads', image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', is_veg: true, available: true, sort_order: 40 },
        { name: 'Butter Naan', description: 'Soft leavened bread with butter, baked in tandoor', price: 50, category: 'Breads', image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', is_veg: true, available: true, sort_order: 41 },
        { name: 'Garlic Naan', description: 'Naan with garlic and fresh coriander', price: 60, category: 'Breads', image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', is_veg: true, available: true, sort_order: 42 },

        // Chinese
        { name: 'Veg Fried Rice', description: 'Wok-tossed rice with mixed vegetables', price: 160, category: 'Chinese', image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', is_veg: true, available: true, sort_order: 50 },
        { name: 'Chicken Fried Rice', description: 'Wok-tossed rice with chicken and vegetables', price: 190, category: 'Chinese', image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', is_veg: false, available: true, sort_order: 51 },
        { name: 'Veg Manchurian', description: 'Crispy vegetable balls in tangy Indo-Chinese sauce', price: 170, category: 'Chinese', image_url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400', is_veg: true, available: true, sort_order: 52 },
        { name: 'Hakka Noodles', description: 'Stir-fried noodles with vegetables in soy sauce', price: 160, category: 'Chinese', image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', is_veg: true, available: true, sort_order: 53 },

        // Desserts
        { name: 'Gulab Jamun', description: 'Soft milk dumplings soaked in rose-cardamom syrup (2 pcs)', price: 80, category: 'Desserts', image_url: 'https://images.unsplash.com/photo-1666190690767-a468d44a9eb5?w=400', is_veg: true, available: true, sort_order: 60 },
        { name: 'Ice Cream', description: 'Choice of vanilla, chocolate, or butterscotch', price: 80, category: 'Desserts', image_url: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400', is_veg: true, available: true, sort_order: 61 },
    ];

    const { data, error } = await supabase.from('menu_items').insert(items);
    if (error) console.error('Menu seed error:', error.message);
    else console.log(`✅ Seeded ${items.length} menu items`);
}

async function seedGallery() {
    console.log('Seeding gallery with restaurant photos...');
    await supabase.from('gallery_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const images = [
        { title: 'Restaurant Interior', category: 'Ambiance', image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', description: 'Elegant dining area' },
        { title: 'Warm Lighting', category: 'Ambiance', image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', description: 'Cozy atmosphere' },
        { title: 'Table Setting', category: 'Ambiance', image_url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=800', description: 'Premium table setup' },
        { title: 'Butter Chicken', category: 'Food', image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800', description: 'Our signature butter chicken' },
        { title: 'Paneer Tikka', category: 'Food', image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800', description: 'Smoky tandoori paneer' },
        { title: 'Biryani', category: 'Food', image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800', description: 'Authentic dum biryani' },
        { title: 'Tandoori Platter', category: 'Food', image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800', description: 'Mixed tandoori platter' },
        { title: 'Curry Selection', category: 'Food', image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800', description: 'Variety of Indian curries' },
        { title: 'Naan Bread', category: 'Food', image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800', description: 'Fresh tandoori naan' },
        { title: 'Kitchen', category: 'Ambiance', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', description: 'Our kitchen in action' },
        { title: 'Dessert', category: 'Food', image_url: 'https://images.unsplash.com/photo-1666190690767-a468d44a9eb5?w=800', description: 'Sweet endings' },
        { title: 'Outdoor Seating', category: 'Ambiance', image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800', description: 'Al fresco dining' },
    ];

    const { error } = await supabase.from('gallery_images').insert(images);
    if (error) console.error('Gallery seed error:', error.message);
    else console.log(`✅ Seeded ${images.length} gallery images`);
}

async function main() {
    console.log('🍽️ Spice Garden Restaurant - Data Seeding\n');
    await seedMenuItems();
    await seedGallery();
    console.log('\n✅ All done!');
}

main().catch(console.error);
