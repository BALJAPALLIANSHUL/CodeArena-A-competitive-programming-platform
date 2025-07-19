# Firebase Service Account Setup Guide

## Step 1: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`your-project-id`)
3. Go to **Project Settings** (gear icon)
4. Click on **Service accounts** tab
5. Click **Generate new private key**
6. Download the JSON file

## Step 2: Place the Service Account File

You have two options:

### Option A: Place in resources folder (Recommended for development)

```
backend/src/main/resources/firebase-service-account.json
```

### Option B: Place anywhere and specify path

Update `application.properties`:

```properties
firebase.service-account-path=/path/to/your/service-account.json
```

## Step 3: Verify Setup

The service account JSON file should look like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com"
}
```

## Step 4: Test the Backend

1. Start the backend server:

   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. The server should start without Firebase-related errors

## Security Notes

- **Never commit** the service account JSON file to version control
- Add `firebase-service-account.json` to your `.gitignore`
- For production, use environment variables or secure secret management

## Troubleshooting

If you get "Firebase service account file not found" error:

1. Check the file path in `application.properties`
2. Ensure the file exists and is readable
3. Verify the JSON file is valid
