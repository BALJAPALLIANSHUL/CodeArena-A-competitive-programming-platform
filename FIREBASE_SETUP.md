# Firebase Setup Guide for CodeArena

This guide will help you set up Firebase Authentication and Hosting for your CodeArena project.

## Prerequisites

- Google account
- Node.js and pnpm installed
- Git repository set up

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `codearena-[your-name]` (or any unique name)
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

## Step 3: Create Web App

1. In Firebase project, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register app with nickname: `codearena-web`
6. Copy the Firebase configuration object

## Step 4: Configure Environment Variables

1. In your project root, create a `.env` file in the `frontend` directory:

   ```bash
   cd frontend
   touch .env
   ```

2. Add your Firebase configuration to `frontend/.env`:

   ```env
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your-app-id-here
   ```

3. Update `.firebaserc` in project root:
   ```json
   {
     "projects": {
       "default": "your-firebase-project-id"
     }
   }
   ```

## Step 5: Install Firebase Tools

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Or using pnpm (after running pnpm setup)
pnpm add -g firebase-tools
```

## Step 6: Login to Firebase

```bash
firebase login
```

This will open a browser window for Google authentication.

## Step 7: Initialize Firebase Hosting

```bash
# Initialize Firebase in your project
firebase init hosting

# Select your project when prompted
# Set public directory to: frontend/dist
# Configure as single-page app: Yes
# Don't overwrite index.html: No
```

## Step 8: Test Locally

```bash
# Install dependencies
cd frontend
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:5173` to test your application.

## Step 9: Build and Deploy

```bash
# Build the project
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

Your app will be available at: `https://your-project-id.web.app`

## Step 10: Configure Custom Domain (Optional)

1. In Firebase Console, go to "Hosting"
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

## Authentication Features

The Firebase Authentication implementation includes:

- **Email/Password Registration**: Users can create accounts with email verification
- **Email/Password Sign In**: Secure authentication with error handling
- **Password Reset**: Users can reset passwords via email
- **Persistent Sessions**: Users stay logged in across browser sessions
- **Email Verification**: Automatic email verification on registration
- **User Profile**: Display name and email management

## Security Rules

For production, consider implementing:

1. **Firestore Security Rules** (if using Firestore)
2. **Storage Security Rules** (if using Firebase Storage)
3. **Authentication State Persistence**

## Environment Variables Reference

| Variable                            | Description           | Example                   |
| ----------------------------------- | --------------------- | ------------------------- |
| `VITE_FIREBASE_API_KEY`             | Firebase API key      | `your-api-key-here`       |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Authentication domain | `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID`          | Project identifier    | `my-project-123`          |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Storage bucket        | `project.appspot.com`     |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID             | `123456789`               |
| `VITE_FIREBASE_APP_ID`              | App identifier        | `1:123456789:web:abc123`  |

## Troubleshooting

### Common Issues

1. **"Firebase not initialized" error**

   - Check that environment variables are set correctly
   - Ensure `.env` file is in the `frontend` directory

2. **Authentication not working**

   - Verify Email/Password provider is enabled in Firebase Console
   - Check browser console for error messages

3. **Deployment fails**

   - Ensure you're logged in: `firebase login`
   - Check project ID in `.firebaserc`
   - Verify build succeeds: `npm run build`

4. **Environment variables not loading**
   - Restart development server after adding `.env` file
   - Ensure variable names start with `VITE_`

### Getting Help

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Hosting Guide](https://firebase.google.com/docs/hosting)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)

## Next Steps

After Firebase setup, consider:

1. **Adding Social Authentication** (Google, GitHub, etc.)
2. **Implementing User Roles** with Firestore
3. **Setting up CI/CD** with GitHub Actions
4. **Adding Analytics** and monitoring
5. **Implementing Firestore** for user data storage
