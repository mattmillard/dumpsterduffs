-- Create 3 Sample Bookings
-- Run this in Supabase SQL Editor

-- Booking 1: Residential customer, 3-day rental
INSERT INTO bookings (
  customer_name,
  customer_email,
  customer_phone,
  size_yards,
  delivery_address,
  delivery_date,
  return_date,
  total_price,
  payment_status,
  status,
  notes
) VALUES (
  'John Smith',
  'john.smith@example.com',
  '(573) 555-0101',
  15,
  '123 Main Street, Columbia, MO 65201',
  CURRENT_DATE + INTERVAL '3 days',
  CURRENT_DATE + INTERVAL '6 days',
  325.00,
  'unpaid',
  'pending',
  'Please place in driveway. Call before delivery.'
);

-- Booking 2: Commercial customer, 5-day rental  
INSERT INTO bookings (
  customer_name,
  customer_email,
  customer_phone,
  size_yards,
  delivery_address,
  delivery_date,
  return_date,
  total_price,
  payment_status,
  status,
  notes
) VALUES (
  'Sarah Johnson - Johnson Construction LLC',
  'sarah.j@example.com',
  '(573) 555-0202',
  15,
  '456 Oak Avenue, Suite 200, Jefferson City, MO 65101',
  CURRENT_DATE + INTERVAL '14 days',
  CURRENT_DATE + INTERVAL '19 days',
  335.00,
  'paid',
  'pending',
  'Behind the building, accessible from alley.'
);

-- Booking 3: Roofing project, 7-day rental
INSERT INTO bookings (
  customer_name,
  customer_email,
  customer_phone,
  size_yards,
  delivery_address,
  delivery_date,
  return_date,
  total_price,
  payment_status,
  status,
  notes
) VALUES (
  'Michael Davis - Davis Roofing Services',
  'mdavis@example.com',
  '(573) 555-0303',
  15,
  '789 Elm Street, Columbia, MO 65203',
  CURRENT_DATE + INTERVAL '21 days',
  CURRENT_DATE + INTERVAL '28 days',
  345.00,
  'paid',
  'pending',
  'Driveway on left side of house.'
);

-- Verify the bookings were created
SELECT 
  id,
  customer_name,
  size_yards,
  delivery_date,
  status,
  total_price
FROM bookings
ORDER BY delivery_date;
