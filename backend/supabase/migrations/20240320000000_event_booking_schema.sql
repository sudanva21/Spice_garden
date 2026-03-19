-- Migration: Add event booking columns to the events table
-- Run this in the Supabase SQL Editor

-- Add missing columns for the event booking system
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 50;
ALTER TABLE events ADD COLUMN IF NOT EXISTS booked_seats INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS price_per_seat INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE events ADD COLUMN IF NOT EXISTS date TIMESTAMPTZ;

-- (event_date column does not exist, so no data migration needed)

-- Allow anon key to also do CRUD on events (admin panel uses anon key via supabaseClient)
-- Drop all existing policies first (idempotent)
DROP POLICY IF EXISTS "Public events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Service roles can manage events" ON events;
DROP POLICY IF EXISTS "Anyone can read active events" ON events;
DROP POLICY IF EXISTS "Anyone can insert events" ON events;
DROP POLICY IF EXISTS "Anyone can update events" ON events;
DROP POLICY IF EXISTS "Anyone can delete events" ON events;

-- Recreate policies
CREATE POLICY "Anyone can read active events" ON events FOR SELECT USING (true);
CREATE POLICY "Anyone can insert events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update events" ON events FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete events" ON events FOR DELETE USING (true);

-- Same for bookings table (needed for the booking flow)
-- First check if bookings table has the right columns
DO $$
BEGIN
    -- Create event bookings table if it doesn't exist with the right schema
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'event_bookings') THEN
        CREATE TABLE event_bookings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            event_id UUID REFERENCES events(id) ON DELETE CASCADE,
            event_title TEXT,
            event_date TIMESTAMPTZ,
            event_venue TEXT,
            attendee_name TEXT NOT NULL,
            attendee_email TEXT NOT NULL,
            attendee_phone TEXT,
            seats INTEGER DEFAULT 1,
            total_amount NUMERIC DEFAULT 0,
            razorpay_order_id TEXT,
            razorpay_payment_id TEXT,
            payment_status TEXT DEFAULT 'pending',
            created_at TIMESTAMPTZ DEFAULT now()
        );

        ALTER TABLE event_bookings ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Anyone can read event_bookings" ON event_bookings FOR SELECT USING (true);
        CREATE POLICY "Anyone can insert event_bookings" ON event_bookings FOR INSERT WITH CHECK (true);
        CREATE POLICY "Anyone can update event_bookings" ON event_bookings FOR UPDATE USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Create the increment_booked_seats RPC function (used by verify-payment API)
CREATE OR REPLACE FUNCTION increment_booked_seats(p_event_id UUID, p_amount INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE events SET booked_seats = booked_seats + p_amount WHERE id = p_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
