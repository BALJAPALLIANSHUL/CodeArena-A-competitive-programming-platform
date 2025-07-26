# CodeArena Deployment Guide

This guide covers deployment strategies for both development and production environments.

## 🏗️ Architecture Overview

```
Production Environment:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Firebase      │    │   Cloud Run     │    │   Cloud Run     │
│   Hosting       │◄──►│   (Backend)     │◄──►│   (Judge)       │
│                 │    │                 │    │                 │
│ - Frontend      │    │ - REST API      │    │ - Code Execution│
│ - CDN           │    │ - Business Logic│    │ - Sandboxing    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Firestore      │    │   Cloud SQL     │    │  Cloud Storage  │
│  (Real-time)    │    │   (MySQL)       │    │  (Files)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start Deployment

### Prerequisites

- Google Cloud Platform account
- Firebase project
- Docker installed
- Google Cloud CLI (`gcloud`)
- Firebase CLI (`firebase`)

### 1. Initial Setup

```bash
# Install Google Cloud CLI
# https://cloud.google.com/sdk/docs/install

# Install Firebase CLI
npm install -g firebase-tools

# Authenticate with Google Cloud
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Authenticate with Firebase
firebase login
firebase use YOUR_PROJECT_ID
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit .env with your actual values
nano .env
```

## 🏠 Local Development Deployment

### Using Docker Compose

```bash
# Start all services
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

### Manual Development Setup

```bash
# Start backend
npm run dev:backend

# Start frontend (in another terminal)
npm run dev

# Start judge service (if needed)
cd judge && docker-compose up
```

## ☁️ Production Deployment

### 1. Frontend Deployment (Firebase Hosting)

#### Build and Deploy

```bash
# Build the frontend
npm run build

# Deploy to Firebase Hosting
npm run deploy
```

#### Firebase Configuration

```json
// firebase.json
{
  "hosting": {
    "public": "frontend/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### 2. Backend Deployment (Cloud Run)

#### Create Dockerfile

```dockerfile
# backend/Dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Make mvnw executable
RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build the application
RUN ./mvnw clean package -DskipTests

# Create runtime image
FROM openjdk:17-jre-slim

WORKDIR /app

# Copy the built jar
COPY --from=0 /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### Deploy to Cloud Run

```bash
# Build and deploy
gcloud run deploy codearena-backend \
  --source backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars SPRING_PROFILES_ACTIVE=prod \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10
```

### 3. Judge Service Deployment (Cloud Run)

#### Create Dockerfile

```dockerfile
# judge/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install Docker CLI
RUN apk add --no-cache docker-cli

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 8081

# Start the service
CMD ["npm", "start"]
```

#### Deploy to Cloud Run

```bash
# Build and deploy
gcloud run deploy codearena-judge \
  --source judge \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 5
```

### 4. Database Setup (Cloud SQL)

#### Create MySQL Instance

```bash
# Create Cloud SQL instance
gcloud sql instances create codearena-db \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=YOUR_ROOT_PASSWORD

# Create database
gcloud sql databases create codearena \
  --instance=codearena-db

# Create user
gcloud sql users create codearena_user \
  --instance=codearena-db \
  --password=YOUR_USER_PASSWORD
```

#### Configure Connection

```bash
# Get connection info
gcloud sql instances describe codearena-db \
  --format="value(connectionName)"

# Update backend environment variables
gcloud run services update codearena-backend \
  --set-env-vars \
  SPRING_DATASOURCE_URL="jdbc:mysql:///codearena?cloudSqlInstance=YOUR_INSTANCE_CONNECTION_NAME&socketFactory=com.google.cloud.sql.mysql.SocketFactory" \
  SPRING_DATASOURCE_USERNAME=codearena_user \
  SPRING_DATASOURCE_PASSWORD=YOUR_USER_PASSWORD
```

### 5. Cloud Storage Setup

#### Create Storage Bucket

```bash
# Create bucket
gsutil mb gs://codearena-storage

# Set public access (for public assets)
gsutil iam ch allUsers:objectViewer gs://codearena-storage

# Set CORS for web access
gsutil cors set cors.json gs://codearena-storage
```

#### CORS Configuration

```json
// cors.json
[
  {
    "origin": ["https://your-domain.web.app", "http://localhost:5173"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

## 🔧 Environment Configuration

### Production Environment Variables

```bash
# Backend Environment Variables
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:mysql:///codearena?cloudSqlInstance=...
SPRING_DATASOURCE_USERNAME=codearena_user
SPRING_DATASOURCE_PASSWORD=your_password
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

# Judge Service Environment Variables
NODE_ENV=production
BACKEND_URL=https://codearena-backend-xxx-uc.a.run.app
FIREBASE_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/app/firebase-key.json

# Frontend Environment Variables
VITE_API_URL=https://codearena-backend-xxx-uc.a.run.app/api
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## 🔒 Security Configuration

### Service Account Setup

```bash
# Create service account
gcloud iam service-accounts create codearena-sa \
  --display-name="CodeArena Service Account"

# Grant necessary roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:codearena-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:codearena-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectViewer"

# Create and download key
gcloud iam service-accounts keys create firebase-key.json \
  --iam-account=codearena-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### SSL/TLS Configuration

```bash
# Cloud Run automatically provides HTTPS
# Firebase Hosting automatically provides HTTPS
# Cloud SQL requires SSL connections
```

## 📊 Monitoring and Logging

### Cloud Logging

```bash
# View logs
gcloud logging read "resource.type=cloud_run_revision" --limit=50

# Create log-based metrics
gcloud logging metrics create api-requests \
  --description="API request count" \
  --log-filter="resource.type=cloud_run_revision AND textPayload:request"
```

### Cloud Monitoring

```bash
# Create alerting policies
gcloud alpha monitoring policies create \
  --policy-from-file=alert-policy.yaml
```

### Example Alert Policy

```yaml
# alert-policy.yaml
displayName: "High Error Rate"
conditions:
  - displayName: "Error rate is high"
    conditionThreshold:
      filter: 'resource.type="cloud_run_revision"'
      comparison: COMPARISON_GREATER_THAN
      thresholdValue: 0.05
      duration: 300s
      aggregations:
        - alignmentPeriod: 60s
          perSeriesAligner: ALIGN_RATE
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          java-version: "17"
          distribution: "temurin"

      - name: Install dependencies
        run: npm run install:all

      - name: Run tests
        run: npm run test:all

      - name: Build frontend
        run: npm run build

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: "${{ secrets.GITHUB_TOKEN }}"
          firebaseServiceAccount: "${{ secrets.FIREBASE_SERVICE_ACCOUNT }}"
          projectId: your-project-id
          channelId: live

      - name: Deploy Backend to Cloud Run
        run: |
          echo ${{ secrets.GCP_SA_KEY }} | base64 -d > key.json
          gcloud auth activate-service-account --key-file=key.json
          gcloud config set project your-project-id
          gcloud run deploy codearena-backend --source backend --region us-central1 --allow-unauthenticated
```

## 🚨 Troubleshooting

### Common Issues

#### Frontend Build Failures

```bash
# Clear cache and rebuild
rm -rf frontend/node_modules frontend/dist
npm run install:all
npm run build
```

#### Backend Deployment Issues

```bash
# Check logs
gcloud run services logs read codearena-backend --region us-central1

# Verify environment variables
gcloud run services describe codearena-backend --region us-central1
```

#### Database Connection Issues

```bash
# Test connection
gcloud sql connect codearena-db --user=root

# Check instance status
gcloud sql instances describe codearena-db
```

#### Judge Service Issues

```bash
# Check container logs
gcloud run services logs read codearena-judge --region us-central1

# Verify Docker access
gcloud run services update codearena-judge --add-cloudsql-instances=codearena-db
```

## 📈 Scaling Configuration

### Auto-scaling Settings

```bash
# Backend scaling
gcloud run services update codearena-backend \
  --min-instances=1 \
  --max-instances=20 \
  --cpu-throttling=false

# Judge service scaling
gcloud run services update codearena-judge \
  --min-instances=0 \
  --max-instances=10 \
  --cpu-throttling=true
```

### Resource Limits

```bash
# Memory and CPU limits
gcloud run services update codearena-backend \
  --memory=2Gi \
  --cpu=2 \
  --timeout=300

gcloud run services update codearena-judge \
  --memory=4Gi \
  --cpu=4 \
  --timeout=600
```

## 🔄 Rollback Strategy

### Version Management

```bash
# List revisions
gcloud run revisions list --service=codearena-backend --region us-central1

# Rollback to previous version
gcloud run services update-traffic codearena-backend \
  --to-revisions=codearena-backend-00001-abc=100 \
  --region us-central1
```

### Database Rollback

```bash
# Create backup before deployment
gcloud sql backups create --instance=codearena-db

# Restore from backup if needed
gcloud sql backups restore BACKUP_ID --instance=codearena-db
```

## 📞 Support

For deployment issues:

- Check [Google Cloud Documentation](https://cloud.google.com/docs)
- Review [Firebase Documentation](https://firebase.google.com/docs)
- Contact support: support@codearena.com
