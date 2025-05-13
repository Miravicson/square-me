-- Check and create 'auth' database
\connect postgres
SELECT 'CREATE DATABASE auth'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'auth')\gexec

-- Check and create 'wallet' database
SELECT 'CREATE DATABASE wallet'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'wallet')\gexec

-- Check and create 'transaction' database
SELECT 'CREATE DATABASE "transaction"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'transaction')\gexec
