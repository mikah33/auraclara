#!/bin/bash

# Test the send-welcome-email function directly via curl

curl -L -X POST 'https://pcyohjfdxkujufprlkxh.supabase.co/functions/v1/send-welcome-email' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjeW9oamZkeGt1anVmcHJsa3hoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA0MjUzNSwiZXhwIjoyMDc1NjE4NTM1fQ.TAOfKcXEda6AYc04VVKt45I7DUVIAZAcrM4kx2ShyJU' \
  -H 'Content-Type: application/json' \
  --data '{"record":{"email":"mikahalbertson12@gmail.com","discount_code":"WELCOME15","unsubscribe_token":"test-123"}}'
