#!/bin/bash

echo "🔍 Testing Cron Job Locally"
echo "=============================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ Error: .env.local file not found"
  echo "Please create .env.local with CRON_SECRET"
  exit 1
fi

# Extract CRON_SECRET
CRON_SECRET=$(grep CRON_SECRET .env.local | cut -d '=' -f2 | tr -d ' "'"'"'')

if [ -z "$CRON_SECRET" ]; then
  echo "❌ Error: CRON_SECRET not found in .env.local"
  exit 1
fi

echo "📋 CRON_SECRET found: ${CRON_SECRET:0:10}..."
echo ""
echo "🚀 Calling cron endpoint..."
echo ""

# Call the cron endpoint
response=$(curl -s -w "\n%{http_code}" -X GET http://localhost:3000/api/cron/check-reminders \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json")

# Extract status code and body
http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

echo "📊 Response Status: $http_code"
echo ""

# Pretty print JSON if jq is available
if command -v jq &> /dev/null; then
  echo "📦 Response Body:"
  echo "$body" | jq '.'
else
  echo "📦 Response Body:"
  echo "$body"
fi

echo ""

if [ "$http_code" -eq 200 ]; then
  echo "✅ Cron job executed successfully!"
else
  echo "❌ Cron job failed with status $http_code"
fi
