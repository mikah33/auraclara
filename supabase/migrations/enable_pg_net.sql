-- Enable pg_net extension for HTTP requests from database
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant permissions
GRANT USAGE ON SCHEMA net TO postgres, anon, authenticated, service_role;
