

UPDATE "Users"
SET balance = "Users".balance + calculated_cashback.cashback
FROM (
         SELECT
             "Contests"."userId", ROUND(SUM("Contests".prize) * 0.10, 2) AS cashback
         FROM
             "Contests"
                 join
             "Users"
             ON
                 "Contests"."userId" = "Users".id
         WHERE "Users".role='customer' AND "Contests"."createdAt" >= '2024-12-25'
           AND "Contests"."createdAt" < '2025-01-15'
         GROUP BY "Contests"."userId"
     ) AS calculated_cashback
WHERE "Users".id = calculated_cashback."userId"
RETURNING
    "Users".id,
    calculated_cashback.cashback,
    "Users".balance AS new_balance;



update "Contests" set "createdAt"='2024-12-26 12:50:00.000000 +00:00' where id=1;



