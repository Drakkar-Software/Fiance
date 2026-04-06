-- Rename French columns in quote_pricing
ALTER TABLE quote_pricing RENAME COLUMN forfait_personnel TO staff_fee;
ALTER TABLE quote_pricing RENAME COLUMN forfait_deplacement TO travel_fee;

-- Rename jour_j_items table
ALTER TABLE jour_j_items RENAME TO day_of_items;

-- Migrate French PricingKey values to English
UPDATE quote_pricing SET pricing_key = 'dinner' WHERE pricing_key = 'repas';
UPDATE quote_pricing SET pricing_key = 'drinks' WHERE pricing_key = 'boisson';
UPDATE quote_pricing SET pricing_key = 'next-day' WHERE pricing_key = 'lendemain';
UPDATE quote_pricing SET pricing_key = 'tableware' WHERE pricing_key = 'vaisselle';
UPDATE quote_pricing SET pricing_key = 'linen' WHERE pricing_key = 'nappe';
UPDATE quote_pricing SET pricing_key = 'vegetarian' WHERE pricing_key = 'vegetarien';
UPDATE quote_pricing SET pricing_key = 'child' WHERE pricing_key = 'enfant';
UPDATE quote_pricing SET pricing_key = 'service' WHERE pricing_key = 'presta';

-- Migrate French IdeaCategory values to English
UPDATE ideas SET category = 'TABLE_DECOR' WHERE category = 'DECO_TABLE';
UPDATE ideas SET category = 'VENUE_DECOR' WHERE category = 'DECO_SALLE';
UPDATE ideas SET category = 'CEREMONY_DECOR' WHERE category = 'DECO_CEREMONIE';
UPDATE ideas SET category = 'ATTIRE' WHERE category = 'TENUE';
UPDATE ideas SET category = 'CAKE' WHERE category = 'GATEAU';
UPDATE ideas SET category = 'VENUE' WHERE category = 'LIEU';
