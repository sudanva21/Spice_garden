const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
    // ── GALLERY ──
    console.log('🗑️  Clearing gallery...');
    await supabase.from('gallery_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const photos = [
        { image_url: 'https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=800', caption: 'Spice Garden Entrance', category: 'Visitors', sort_order: 1, active: true },
        { image_url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800', caption: 'Tropical Garden Path', category: 'Visitors', sort_order: 2, active: true },
        { image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800', caption: 'Fresh Turmeric Roots', category: 'Spices', sort_order: 3, active: true },
        { image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800', caption: 'Assorted Spice Collection', category: 'Spices', sort_order: 4, active: true },
        { image_url: 'https://images.unsplash.com/photo-1501004318855-b174af8261fb?w=800', caption: 'Cinnamon Bark Harvest', category: 'Spices', sort_order: 5, active: true },
        { image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800', caption: 'Botanical Garden Walk', category: 'Visitors', sort_order: 6, active: true },
        { image_url: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=800', caption: 'Dried Chili Peppers', category: 'Spices', sort_order: 7, active: true },
        { image_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800', caption: 'Cardamom Pods Closeup', category: 'Spices', sort_order: 8, active: true },
        { image_url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800', caption: 'Lush Green Canopy', category: 'Wildlife', sort_order: 9, active: true },
        { image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800', caption: 'Morning Dew on Leaves', category: 'Wildlife', sort_order: 10, active: true },
        { image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800', caption: 'Star Anise & Cloves', category: 'Spices', sort_order: 11, active: true },
        { image_url: 'https://images.unsplash.com/photo-1504567961542-e24d9439a724?w=800', caption: 'Garden Aerial View', category: 'Aerial', sort_order: 12, active: true },
    ];
    const { data: gData, error: gErr } = await supabase.from('gallery_images').insert(photos).select();
    console.log(gErr ? '❌ Gallery: ' + gErr.message : `✅ ${gData.length} gallery images`);

    // ── BLOG POSTS ──
    console.log('\n📝 Seeding blog posts...');
    await supabase.from('blog_posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const blogs = [
        {
            title: 'A Walk Through Our Spice Trails',
            slug: 'walk-through-spice-trails',
            excerpt: 'Discover what awaits you on a guided morning tour through Spice Garden, Gokak.',
            content: 'Every morning at Spice Garden begins with the gentle aroma of cardamom and the earthy scent of fresh turmeric. Our guided spice trail takes you through winding paths bordered by over 50 varieties of spice plants.\n\nThe 90-minute walk covers the key zones: the Pepper Corridor, the Cinnamon Grove, the Ayurvedic Herb Section, and the Vanilla Greenhouse. Our guides share stories about each spice and their significance in traditional Ayurvedic medicine.\n\nVisitors often say the highlight is the tasting station at the end where you can compare fresh vs dried spices.',
            featured_image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
            category: 'Experiences',
            author: 'Spice Garden Team',
            published: true,
            published_at: new Date().toISOString()
        },
        {
            title: 'Why Gokak Is a Must-Visit Botanical Destination',
            slug: 'gokak-botanical-destination',
            excerpt: 'From Gokak Falls to our spice garden — why this Karnataka town deserves a visit.',
            content: 'Gokak in Belagavi district has long been known for the magnificent Gokak Falls. But recently the town has become a hub for botanical tourism thanks to the Spice Garden.\n\nThe garden offers visitors a chance to see spice cultivation up close. Unlike commercial farms, our garden is designed as an educational space — admission is free and guided tours are available.\n\nWith yoga sessions, photography zones, and seasonal events, we are helping put Gokak on the map as a destination for nature-based tourism.',
            featured_image_url: 'https://images.unsplash.com/photo-1504567961542-e24d9439a724?w=800',
            category: 'Travel',
            author: 'Spice Garden Team',
            published: true,
            published_at: new Date().toISOString()
        }
    ];
    const { data: bData, error: bErr } = await supabase.from('blog_posts').insert(blogs).select();
    console.log(bErr ? '❌ Blog: ' + bErr.message : `✅ ${bData.length} blog posts`);

    // ── EVENTS ──
    console.log('\n📅 Seeding events...');
    await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const events = [
        {
            title: 'Sunday Morning Yoga in the Garden',
            description: 'Start your Sunday with a relaxing yoga session surrounded by aromatic spice plants. Open to all ages. Mats provided.',
            event_date: '2026-03-16T06:00:00+05:30',
            location: 'Spice Garden Open Pavilion, Gokak',
            image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
            category: 'Wellness',
            active: true
        },
        {
            title: 'School Nature Walk & Spice Quiz',
            description: 'A guided walk for school groups with an interactive spice quiz. Certificates for all participants.',
            event_date: '2026-03-22T09:00:00+05:30',
            location: 'Spice Garden Main Trail, Gokak',
            image_url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800',
            category: 'Education',
            active: true
        }
    ];
    const { data: eData, error: eErr } = await supabase.from('events').insert(events).select();
    console.log(eErr ? '❌ Events: ' + eErr.message : `✅ ${eData.length} events`);
}

seed().catch(console.error);
