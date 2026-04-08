ALTER TABLE guests ADD COLUMN children_count INTEGER DEFAULT 0;
UPDATE guests SET children_count = CASE WHEN is_child = 1 THEN 1 ELSE 0 END;
ALTER TABLE guests DROP COLUMN is_child;
