# Firebase Integration for CodeArena Backend

This document explains the changes made to integrate Firebase authentication with the CodeArena backend.

## Overview

The backend has been updated to use Firebase authentication instead of JWT-based authentication with H2 database user management. The system now:

- Uses Firebase for user authentication
- Stores user roles separately in H2 database
- Verifies Firebase ID tokens on each request
- Maintains role-based access control

## Key Changes

### 1. Dependencies

- **Added**: Firebase Admin SDK (`firebase-admin`)
- **Removed**: H2 database dependency (kept for user roles)

### 2. New Components

#### FirebaseConfig

- Initializes Firebase Admin SDK
- Configures Firebase credentials
- Provides FirebaseAuth bean

#### FirebaseAuthService

- Verifies Firebase ID tokens
- Retrieves user information from Firebase
- Handles Firebase authentication operations

#### UserRole Entity

- Stores user roles separately from Firebase
- Links to Firebase UID
- Includes display name and active status

#### FirebaseAuthFilter

- Replaces JwtAuthFilter
- Verifies Firebase tokens on each request
- Sets up Spring Security context

### 3. Updated Components

#### UserService

- Now manages UserRole entities
- Integrates with FirebaseAuthService
- Handles role-based operations

#### UserController

- `/api/auth/verify` - Verifies Firebase tokens
- `/api/auth/register` - Creates user role entries
- `/api/auth/me` - Gets current user information

#### SecurityConfig

- Updated to use FirebaseAuthFilter
- Permits Firebase verification endpoints
- Maintains role-based security

## API Endpoints

### POST `/api/auth/verify`

Verifies a Firebase ID token and returns user information.

**Request:**

```json
{
  "idToken": "firebase-id-token-here"
}
```

**Response:**

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

### POST `/api/auth/register`

Creates a user role entry for a Firebase user.

**Request:**

```json
{
  "email": "user@example.com",
  "role": "USER",
  "displayName": "John Doe"
}
```

**Response:**

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

### GET `/api/auth/me`

Gets current user information from security context.

**Headers:**

```
Authorization: Bearer firebase-id-token-here
```

**Response:**

```json
{
  "uid": "firebase-user-uid",
  "email": "user@example.com",
  "role": "USER",
  "displayName": "John Doe",
  "isActive": true
}
```

## Configuration

### Firebase Service Account

You need to set up Firebase service account credentials:

1. Go to Firebase Console > Project Settings > Service Accounts
2. Generate new private key
3. Download the JSON file
4. Update `application.properties` with the credentials

### Environment Variables

For production, set these environment variables:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
```

## Security Flow

1. **Frontend**: User signs in with Firebase
2. **Frontend**: Gets Firebase ID token
3. **Frontend**: Sends token to `/api/auth/verify`
4. **Backend**: Verifies token with Firebase
5. **Backend**: Checks user role in database
6. **Backend**: Returns user information
7. **Frontend**: Uses token for subsequent API calls
8. **Backend**: FirebaseAuthFilter verifies token on each request

## Migration Notes

- Old JWT-based authentication has been removed
- User passwords are no longer stored (handled by Firebase)
- User roles are stored separately in H2 database
- Firebase UID is used as the primary identifier

## Testing

1. Start the backend server
2. Use the frontend to sign in with Firebase
3. Test API endpoints with Firebase ID tokens
4. Verify role-based access control works correctly
