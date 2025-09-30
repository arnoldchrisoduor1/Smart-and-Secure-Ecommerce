-- init-scripts/01-create-databases.sql
-- This script creates separate databases for each microservice

-- Create databases for each service
CREATE DATABASE auth_db;
CREATE DATABASE user_db;
CREATE DATABASE catalog_db;
CREATE DATABASE cart_db;
CREATE DATABASE order_db;
CREATE DATABASE payment_db;
CREATE DATABASE notification_db;
CREATE DATABASE analytics_db;

-- Create users for each service (following microservice isolation principles)
CREATE USER auth_service WITH PASSWORD 'auth_service_pass';
CREATE USER user_service WITH PASSWORD 'user_service_pass';
CREATE USER catalog_service WITH PASSWORD 'catalog_service_pass';
CREATE USER cart_service WITH PASSWORD 'cart_service_pass';
CREATE USER order_service WITH PASSWORD 'order_service_pass';
CREATE USER payment_service WITH PASSWORD 'payment_service_pass';
CREATE USER notification_service WITH PASSWORD 'notification_service_pass';
CREATE USER analytics_service WITH PASSWORD 'analytics_service_pass';

-- Grant privileges to each service user for their respective databases
GRANT ALL PRIVILEGES ON DATABASE auth_db TO auth_service;
GRANT ALL PRIVILEGES ON DATABASE user_db TO user_service;
GRANT ALL PRIVILEGES ON DATABASE catalog_db TO catalog_service;
GRANT ALL PRIVILEGES ON DATABASE cart_db TO cart_service;
GRANT ALL PRIVILEGES ON DATABASE order_db TO order_service;
GRANT ALL PRIVILEGES ON DATABASE payment_db TO payment_service;
GRANT ALL PRIVILEGES ON DATABASE notification_db TO notification_service;
GRANT ALL PRIVILEGES ON DATABASE analytics_db TO analytics_service;

-- Connect to each database and grant schema permissions
\c auth_db;
GRANT ALL ON SCHEMA public TO auth_service;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO auth_service;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO auth_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO auth_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO auth_service;

\c user_db;
GRANT ALL ON SCHEMA public TO user_service;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO user_service;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO user_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO user_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO user_service;

\c catalog_db;
GRANT ALL ON SCHEMA public TO catalog_service;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO catalog_service;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO catalog_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO catalog_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO catalog_service;

\c cart_db;
GRANT ALL ON SCHEMA public TO cart_service;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cart_service;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cart_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO cart_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO cart_service;

\c order_db;
GRANT ALL ON SCHEMA public TO order_service;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO order_service;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO order_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO order_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO order_service;

\c payment_db;
GRANT ALL ON SCHEMA public TO payment_service;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO payment_service;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO payment_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO payment_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO payment_service;

\c notification_db;
GRANT ALL ON SCHEMA public TO notification_service;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO notification_service;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO notification_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO notification_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO notification_service;

\c analytics_db;
GRANT ALL ON SCHEMA public TO analytics_service;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO analytics_service;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO analytics_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO analytics_service;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO analytics_service;