# Backend Testing Guide

## Prerequisites

1. **Firebase Service Account**: Make sure you have downloaded the Firebase service account JSON file and placed it in:

   ```
   backend/src/main/resources/firebase-service-account.json
   ```

2. **Backend Running**: Start the backend server:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

## Test Endpoints

### 1. Health Check (No Authentication Required)

```bash
curl http://localhost:8080/api/auth/verify
```

### 2. Test Firebase Token Verification

```bash
curl -X POST http://localhost:8080/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"idToken": "your-firebase-id-token-here"}'
```

### 3. Test User Registration (After Firebase Auth)

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "role": "USER",
    "displayName": "Test User"
  }'
```

### 4. Test Get Current User (Requires Authentication)

```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer your-firebase-id-token-here"
```

## Testing with Frontend

1. **Start Frontend**:

   ```bash
   cd frontend
   pnpm dev
   ```

2. **Sign in with Firebase** in the frontend

3. **Get Firebase ID Token** from the frontend (you can get this from the browser console):

   ```javascript
   // In browser console
   firebase
     .auth()
     .currentUser.getIdToken()
     .then((token) => console.log(token));
   ```

4. **Test Backend Endpoints** using the token from step 3

## Expected Responses

### Successful Token Verification

```json
{
  "uid": "firebase-user-uid",
  "email": "user@example.com",
  "emailVerified": true,
  "role": "USER",
  "displayName": "John Doe",
  "isActive": true
}
```

### Successful Registration

```json
{
  "id": 1,
  "firebaseUid": "firebase-user-uid",
  "email": "user@example.com",
  "role": "USER",
  "displayName": "John Doe",
  "isActive": true
}
```

### Error Responses

```json
{
  "error": "Invalid ID token"
}
```

## Troubleshooting

### 1. Firebase Service Account Not Found

**Error**: `Firebase service account file not found`
**Solution**:

- Download service account JSON from Firebase Console
- Place it in `backend/src/main/resources/firebase-service-account.json`

### 2. Invalid Token

**Error**: `Invalid ID token`
**Solution**:

- Make sure you're using a valid Firebase ID token
- Token should be obtained from frontend after Firebase authentication

### 3. User Not Found in Firebase

**Error**: `User not found in Firebase`
**Solution**:

- User must be registered in Firebase first
- Use the frontend to create a Firebase account

### 4. Port Already in Use

**Error**: `Port 8080 is already in use`
**Solution**:

- Change port in `application.properties`
- Or kill the process using port 8080

## Manual Testing Steps

1. **Start Backend**: `mvn spring-boot:run`
2. **Start Frontend**: `pnpm dev`
3. **Register/Sign in** in frontend
4. **Get Firebase token** from browser console
5. **Test backend endpoints** with the token
6. **Verify responses** match expected format
