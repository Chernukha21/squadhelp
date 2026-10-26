select jsonb_object_agg(role, role_counts.user_count)
from (SELECT "Users".role, count(*) as user_count FROM "Users" GROUP BY "role" ) AS role_counts
