-- Sample Yearly Statistics for Koimeret Dairies
-- Run this after initdb to populate historical data

-- Get farm ID
DO $$
DECLARE
    farm_id INTEGER;
    cow1_id INTEGER;
    cow2_id INTEGER;
    cow3_id INTEGER;
    worker1_id INTEGER;
    worker2_id INTEGER;
BEGIN
    SELECT id INTO farm_id FROM farm_farm WHERE name = 'Koimeret Dairies' LIMIT 1;
    SELECT id INTO cow1_id FROM dairy_cow WHERE tag_number = 'KD001' AND farm_id = farm_id LIMIT 1;
    SELECT id INTO cow2_id FROM dairy_cow WHERE tag_number = 'KD002' AND farm_id = farm_id LIMIT 1;
    SELECT id INTO cow3_id FROM dairy_cow WHERE tag_number = 'KD003' AND farm_id = farm_id LIMIT 1;
    SELECT id INTO worker1_id FROM core_user WHERE phone = '0711111111' LIMIT 1;
    SELECT id INTO worker2_id FROM core_user WHERE phone = '0722222222' LIMIT 1;

    -- Insert sample milk logs for the past 365 days
    FOR i IN 0..364 LOOP
        -- Morning milking - Cow 1 (Malkia)
        IF cow1_id IS NOT NULL THEN
            INSERT INTO dairy_milklog (farm_id, cow_id, milked_by_id, session, liters, date, notes, created_at, modified_at)
            VALUES (
                farm_id, cow1_id, worker1_id, 'morning',
                ROUND((16 + RANDOM() * 4)::numeric, 1),
                CURRENT_DATE - i,
                NULL,
                NOW(), NOW()
            ) ON CONFLICT DO NOTHING;

            -- Evening milking - Cow 1
            INSERT INTO dairy_milklog (farm_id, cow_id, milked_by_id, session, liters, date, notes, created_at, modified_at)
            VALUES (
                farm_id, cow1_id, worker2_id, 'evening',
                ROUND((14 + RANDOM() * 3)::numeric, 1),
                CURRENT_DATE - i,
                NULL,
                NOW(), NOW()
            ) ON CONFLICT DO NOTHING;
        END IF;

        -- Morning milking - Cow 2 (Zawadi)
        IF cow2_id IS NOT NULL THEN
            INSERT INTO dairy_milklog (farm_id, cow_id, milked_by_id, session, liters, date, notes, created_at, modified_at)
            VALUES (
                farm_id, cow2_id, worker1_id, 'morning',
                ROUND((14 + RANDOM() * 4)::numeric, 1),
                CURRENT_DATE - i,
                NULL,
                NOW(), NOW()
            ) ON CONFLICT DO NOTHING;

            -- Evening milking - Cow 2
            INSERT INTO dairy_milklog (farm_id, cow_id, milked_by_id, session, liters, date, notes, created_at, modified_at)
            VALUES (
                farm_id, cow2_id, worker2_id, 'evening',
                ROUND((12 + RANDOM() * 3)::numeric, 1),
                CURRENT_DATE - i,
                NULL,
                NOW(), NOW()
            ) ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;

    RAISE NOTICE 'Inserted milk logs for 365 days';
END $$;

-- Insert sample milk sales for the past year
INSERT INTO sales_sale (farm_id, buyer_id, sale_type, liters_sold, price_per_liter, total_amount, sale_date, payment_status, recorded_by_id, created_at, modified_at)
SELECT
    f.id as farm_id,
    b.id as buyer_id,
    'milk' as sale_type,
    ROUND((25 + RANDOM() * 15)::numeric, 1) as liters_sold,
    60.00 as price_per_liter,
    0 as total_amount, -- Will be calculated
    CURRENT_DATE - (generate_series * 1) as sale_date,
    CASE WHEN RANDOM() > 0.2 THEN 'paid' ELSE 'pending' END as payment_status,
    u.id as recorded_by_id,
    NOW(), NOW()
FROM farm_farm f
CROSS JOIN generate_series(0, 364)
JOIN sales_buyer b ON b.farm_id = f.id AND b.buyer_type = 'dairy_collection_center'
JOIN core_user u ON u.phone = '0700000000'
WHERE f.name = 'Koimeret Dairies'
ON CONFLICT DO NOTHING;

-- Update total_amount for sales
UPDATE sales_sale SET total_amount = liters_sold * price_per_liter WHERE total_amount = 0;

-- Insert sample sheep/meat sales (monthly)
INSERT INTO sales_sale (farm_id, buyer_id, sale_type, quantity, unit_price, total_amount, sale_date, payment_status, notes, recorded_by_id, created_at, modified_at)
SELECT
    f.id as farm_id,
    b.id as buyer_id,
    'livestock' as sale_type,
    FLOOR(1 + RANDOM() * 2)::INTEGER as quantity,
    ROUND((10000 + RANDOM() * 8000)::numeric, 0) as unit_price,
    0 as total_amount,
    CURRENT_DATE - (generate_series * 30) as sale_date,
    'paid' as payment_status,
    CASE
        WHEN RANDOM() > 0.6 THEN 'Sold mature ewe'
        WHEN RANDOM() > 0.3 THEN 'Sold lamb for meat'
        ELSE 'Sold breeding ram'
    END as notes,
    u.id as recorded_by_id,
    NOW(), NOW()
FROM farm_farm f
CROSS JOIN generate_series(0, 11)
JOIN sales_buyer b ON b.farm_id = f.id AND b.buyer_type = 'regular'
JOIN core_user u ON u.phone = '0700000000'
WHERE f.name = 'Koimeret Dairies'
LIMIT 12
ON CONFLICT DO NOTHING;

-- Update total for livestock sales
UPDATE sales_sale SET total_amount = quantity * unit_price WHERE sale_type = 'livestock' AND total_amount = 0;

-- Sample feed purchases (monthly)
INSERT INTO feeds_feedpurchase (farm_id, feed_item_id, quantity, unit_price, total_cost, purchase_date, supplier, recorded_by_id, created_at, modified_at)
SELECT
    f.id as farm_id,
    fi.id as feed_item_id,
    ROUND((50 + RANDOM() * 100)::numeric, 0) as quantity,
    fi.cost_per_unit as unit_price,
    0 as total_cost,
    CURRENT_DATE - (gs * 30) as purchase_date,
    CASE
        WHEN RANDOM() > 0.5 THEN 'Bomet Agrovet'
        ELSE 'Kericho Feeds Ltd'
    END as supplier,
    u.id as recorded_by_id,
    NOW(), NOW()
FROM farm_farm f
CROSS JOIN generate_series(0, 11) gs
JOIN feeds_feeditem fi ON fi.farm_id = f.id
JOIN core_user u ON u.phone = '0700000000'
WHERE f.name = 'Koimeret Dairies'
ON CONFLICT DO NOTHING;

-- Update total cost for feed purchases
UPDATE feeds_feedpurchase SET total_cost = quantity * unit_price WHERE total_cost = 0;

-- Sample daily tasks completed (past 30 days)
INSERT INTO tasks_taskinstance (farm_id, template_id, assigned_to_id, scheduled_date, scheduled_time, status, completed_at, completed_by_id, created_at, modified_at)
SELECT
    f.id as farm_id,
    tt.id as template_id,
    CASE WHEN RANDOM() > 0.5 THEN w1.id ELSE w2.id END as assigned_to_id,
    CURRENT_DATE - gs as scheduled_date,
    tt.default_time as scheduled_time,
    CASE WHEN RANDOM() > 0.1 THEN 'completed' ELSE 'skipped' END as status,
    CASE WHEN RANDOM() > 0.1 THEN (CURRENT_TIMESTAMP - (gs || ' days')::interval) ELSE NULL END as completed_at,
    CASE WHEN RANDOM() > 0.5 THEN w1.id ELSE w2.id END as completed_by_id,
    NOW(), NOW()
FROM farm_farm f
CROSS JOIN generate_series(0, 29) gs
JOIN tasks_tasktemplate tt ON tt.farm_id = f.id AND tt.category = 'daily'
JOIN core_user w1 ON w1.phone = '0711111111'
JOIN core_user w2 ON w2.phone = '0722222222'
WHERE f.name = 'Koimeret Dairies'
ON CONFLICT DO NOTHING;

-- Summary query for yearly milk production
SELECT
    DATE_TRUNC('month', date) as month,
    SUM(liters) as total_liters,
    COUNT(*) as milking_sessions,
    ROUND(AVG(liters)::numeric, 1) as avg_per_session
FROM dairy_milklog
WHERE date >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY DATE_TRUNC('month', date)
ORDER BY month;

-- Summary query for yearly sales
SELECT
    DATE_TRUNC('month', sale_date) as month,
    sale_type,
    SUM(total_amount) as total_revenue,
    COUNT(*) as num_sales
FROM sales_sale
WHERE sale_date >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY DATE_TRUNC('month', sale_date), sale_type
ORDER BY month, sale_type;

/*
=== YEARLY STATISTICS SUMMARY ===

To get milk production trends:
SELECT DATE_TRUNC('month', date) as month, SUM(liters) as total
FROM dairy_milklog GROUP BY 1 ORDER BY 1;

To get sales revenue:
SELECT DATE_TRUNC('month', sale_date) as month, SUM(total_amount) as revenue
FROM sales_sale GROUP BY 1 ORDER BY 1;

To get worker task completion:
SELECT u.full_name, COUNT(*) as tasks_completed
FROM tasks_taskinstance ti
JOIN core_user u ON ti.completed_by_id = u.id
WHERE ti.status = 'completed'
GROUP BY u.full_name;

To export data for charts (JSON format):
SELECT json_agg(row_to_json(t))
FROM (
    SELECT DATE_TRUNC('month', date)::date as month, SUM(liters) as liters
    FROM dairy_milklog
    GROUP BY 1 ORDER BY 1
) t;
*/
