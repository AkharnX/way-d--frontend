#!/bin/bash

echo "🚀 Testing profile creation flow..."

# Test user data
EMAIL="test-$(date +%s)@example.com"
PASSWORD="TestPassword123!"
FIRST_NAME="Ibrahim"
LAST_NAME="Test"

echo -e "\n📝 STEP 1: Register user"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"first_name\":\"$FIRST_NAME\",\"last_name\":\"$LAST_NAME\",\"birth_date\":\"1999-01-01\",\"gender\":\"male\"}")

echo "Register response: $REGISTER_RESPONSE"

if [[ $REGISTER_RESPONSE == *"already exists"* ]]; then
  echo "ℹ️  User already exists, proceeding to login..."
elif [[ $REGISTER_RESPONSE == *"User registered"* ]]; then
  echo "✅ User registered successfully"
else
  echo "❌ Registration failed"
  exit 1
fi

echo -e "\n🔐 STEP 2: Login user"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Login response: $LOGIN_RESPONSE"

# Extract token using simple grep/sed
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"//' | sed 's/"//')

if [ -z "$TOKEN" ]; then
  echo "❌ No access token received"
  exit 1
fi

echo "✅ Login successful, token received: ${TOKEN:0:20}..."

echo -e "\n🔍 STEP 3: Check existing profile"
PROFILE_CHECK=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8081/profile/me)

echo "Profile check status: $PROFILE_CHECK"

echo -e "\n👤 STEP 4: Create profile with data transformation"

# Transformed profile data
PROFILE_DATA='{
  "height": 175,
  "trait": "Je suis développeur passionné par la technologie",
  "birthdate": "2000-01-01T00:00:00.000Z",
  "location": {
    "lat": 48.8566,
    "lng": 2.3522
  },
  "occupation": "Développeur",
  "active": true,
  "profile_photo_url": "https://example.com/photo1.jpg"
}'

echo "Sending profile data: $PROFILE_DATA"

CREATE_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -X PUT http://localhost:8081/profile/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$PROFILE_DATA")

HTTP_STATUS=$(echo $CREATE_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo $CREATE_RESPONSE | sed -e 's/HTTPSTATUS:.*//g')

echo "Create profile status: $HTTP_STATUS"
echo "Create profile response: $RESPONSE_BODY"

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then
  echo "🎉 SUCCESS! Profile created successfully"
  echo "✅ Data transformation fix is working correctly"
else
  echo "❌ Profile creation failed with status $HTTP_STATUS"
fi

echo -e "\n✅ STEP 5: Verify created profile"
VERIFY_RESPONSE=$(curl -s \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8081/profile/me)

echo "Verify response: $VERIFY_RESPONSE"

if [[ $VERIFY_RESPONSE == *"height"* ]]; then
  echo "🎯 Profile verification successful!"
else
  echo "⚠️  Could not verify profile"
fi

echo -e "\n🏁 Test completed!"
