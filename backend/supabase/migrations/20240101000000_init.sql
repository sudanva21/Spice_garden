-- Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    visit_date DATE NOT NULL,
    group_size INTEGER NOT NULL,
    tour_type TEXT,
    interests TEXT[],
    special_requirements TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Contacts Table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Newsletter Subscribers Table
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    subscribed_at TIMESTAMPTZ DEFAULT now(),
    active BOOLEAN DEFAULT true
);

-- Blog Posts Table
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    featured_image_url TEXT,
    category TEXT,
    author TEXT DEFAULT 'Spice Garden Team',
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Events Table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ NOT NULL,
    event_type TEXT,
    image_url TEXT,
    ticket_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Gallery Images Table
CREATE TABLE gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    caption TEXT,
    category TEXT,
    sort_order INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Spices Table
CREATE TABLE spices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tagline TEXT,
    origin_story TEXT,
    culinary_uses TEXT,
    ayurvedic_benefits TEXT,
    growing_season TEXT,
    dish_it_transforms TEXT,
    flavor_profile JSONB,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Testimonials Table
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_name TEXT NOT NULL,
    city TEXT,
    rating INTEGER,
    review TEXT NOT NULL,
    visit_date DATE,
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Chat Sessions Table
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    messages JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE spices ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Public READ for selected tables
CREATE POLICY "Public profiles are viewable by everyone" ON blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Public events are viewable by everyone" ON events FOR SELECT USING (active = true);
CREATE POLICY "Public gallery images are viewable by everyone" ON gallery_images FOR SELECT USING (active = true);
CREATE POLICY "Public spices viewable by everyone" ON spices FOR SELECT USING (true);
CREATE POLICY "Approved testimonials viewable by everyone" ON testimonials FOR SELECT USING (approved = true);

-- Auth WRITE access - only allow authenticated admin users to fully control tables
CREATE POLICY "Service roles can manage bookings" ON bookings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Service roles can manage contacts" ON contacts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Service roles can manage newsletter_subscribers" ON newsletter_subscribers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Service roles can manage blog_posts" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Service roles can manage events" ON events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Service roles can manage gallery_images" ON gallery_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Service roles can manage spices" ON spices FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Service roles can manage testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Service roles can manage chat_sessions" ON chat_sessions FOR ALL USING (auth.role() = 'authenticated');

-- Because Express JS backend uses Service Role Key, it will bypass RLS normally for server side operations. 
