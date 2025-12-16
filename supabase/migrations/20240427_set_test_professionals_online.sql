UPDATE professionals 
SET online_status = true, last_seen = NOW()
WHERE id IN (
  SELECT id FROM professionals 
  ORDER BY rating DESC 
  LIMIT 3
);
