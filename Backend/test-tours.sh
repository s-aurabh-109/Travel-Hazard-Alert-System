#!/bin/bash

# Smart Safety Tour API - Testing Script for Postman Users
# This script demonstrates how to test the tour endpoints

BASE_URL="http://localhost:5001"
TIMESTAMP=$(date +%s)

echo "=========================================="
echo "Smart Safety Tour - Manual Testing Guide"
echo "=========================================="

# Step 1: Register a user
echo -e "\n\n>>> STEP 1: Register a User <<<"
USER_EMAIL="john-${TIMESTAMP}@example.com"
USER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"John Doe\",
    \"email\": \"$USER_EMAIL\",
    \"password\": \"Password123!\",
    \"role\": \"user\"
  }")
echo "$USER_RESPONSE" | jq .
USER_TOKEN=$(echo "$USER_RESPONSE" | jq -r '.token')
USER_ID=$(echo "$USER_RESPONSE" | jq -r '.user.id')
echo "User Token: $USER_TOKEN"

# Step 2: Create first tour
echo -e "\n\n>>> STEP 2: Create Mountain Safety Tour <<<"
TOUR1_RESPONSE=$(curl -s -X POST $BASE_URL/api/tours \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "title": "Mountain Safety Tour",
    "description": "A guided tour through mountain trails with safety checkpoints",
    "location": "Rocky Mountains, Colorado",
    "start_time": "2026-07-15T08:00:00Z",
    "end_time": "2026-07-15T18:00:00Z"
  }')
echo "$TOUR1_RESPONSE" | jq .
TOUR1_ID=$(echo "$TOUR1_RESPONSE" | jq -r '.tour.id')
echo "Tour 1 ID: $TOUR1_ID"

# Step 3: Create second tour
echo -e "\n\n>>> STEP 3: Create Beach Safety Walk <<<"
TOUR2_RESPONSE=$(curl -s -X POST $BASE_URL/api/tours \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "title": "Beach Safety Walk",
    "description": "Coastal walk with lifeguard stations",
    "location": "Miami Beach, Florida",
    "start_time": "2026-08-01T09:00:00Z",
    "end_time": "2026-08-01T15:00:00Z"
  }')
echo "$TOUR2_RESPONSE" | jq .
TOUR2_ID=$(echo "$TOUR2_RESPONSE" | jq -r '.tour.id')
echo "Tour 2 ID: $TOUR2_ID"

# Step 4: Get all tours
echo -e "\n\n>>> STEP 4: Get All Tours <<<"
curl -s -X GET $BASE_URL/api/tours \
  -H "Authorization: Bearer $USER_TOKEN" | jq .

# Step 5: Get single tour
echo -e "\n\n>>> STEP 5: Get Single Tour (ID: $TOUR1_ID) <<<"
curl -s -X GET $BASE_URL/api/tours/$TOUR1_ID \
  -H "Authorization: Bearer $USER_TOKEN" | jq .

# Step 6: Update tour
echo -e "\n\n>>> STEP 6: Update Tour (ID: $TOUR1_ID) <<<"
curl -s -X PUT $BASE_URL/api/tours/$TOUR1_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "title": "Updated Mountain Safety Tour",
    "description": "Enhanced tour with new checkpoints",
    "status": "completed"
  }' | jq .

# Step 7: Test missing token (should fail)
echo -e "\n\n>>> STEP 7: Update Tour WITHOUT Token (Should Fail) <<<"
curl -s -X PUT $BASE_URL/api/tours/$TOUR1_ID \
  -H "Content-Type: application/json" \
  -d '{"title": "Test"}' | jq .

# Step 8: Test non-existent tour (should fail)
echo -e "\n\n>>> STEP 8: Get Non-Existent Tour (Should Fail) <<<"
curl -s -X GET $BASE_URL/api/tours/99999 \
  -H "Authorization: Bearer $USER_TOKEN" | jq .

# Step 9: Register admin
echo -e "\n\n>>> STEP 9: Register Admin User <<<"
ADMIN_EMAIL="admin-${TIMESTAMP}@example.com"
ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Admin User\",
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"AdminPass123!\",
    \"role\": \"admin\"
  }")
echo "$ADMIN_RESPONSE" | jq .
ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | jq -r '.token')
echo "Admin Token: $ADMIN_TOKEN"

# Step 10: Admin updates user's tour
echo -e "\n\n>>> STEP 10: Admin Updates User's Tour <<<"
curl -s -X PUT $BASE_URL/api/tours/$TOUR1_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "title": "Admin Modified Tour",
    "status": "paused"
  }' | jq .

# Step 11: Delete tour
echo -e "\n\n>>> STEP 11: Delete Tour (ID: $TOUR2_ID) <<<"
curl -s -X DELETE $BASE_URL/api/tours/$TOUR2_ID \
  -H "Authorization: Bearer $USER_TOKEN" | jq .

# Step 12: Test delete non-existent (should fail)
echo -e "\n\n>>> STEP 12: Delete Non-Existent Tour (Should Fail) <<<"
curl -s -X DELETE $BASE_URL/api/tours/99999 \
  -H "Authorization: Bearer $USER_TOKEN" | jq .

# Step 13: Test missing required fields
echo -e "\n\n>>> STEP 13: Create Tour Missing Location (Should Fail) <<<"
curl -s -X POST $BASE_URL/api/tours \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "title": "Incomplete Tour"
  }' | jq .

echo -e "\n\n=========================================="
echo "Testing Complete!"
echo "=========================================="
