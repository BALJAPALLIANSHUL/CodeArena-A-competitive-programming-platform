# CodeArena - Competitive Programming Platform

A full-stack competitive programming platform built with React, Spring Boot, and Firebase. Features user authentication, problem management, real-time submissions, and a secure code execution environment.

## 🚀 Features

- **User Authentication**: Firebase-based authentication with email verification
  - **Note:** User registration is handled by Firebase Authentication on the frontend. After successful registration, the frontend automatically registers the user in the backend for role management. **Passwords are never sent to or stored in the backend.**
- **Problem Management**: CRUD operations for coding problems with test cases
- **Real-time Submissions**: Live submission tracking and results
- **Secure Code Execution**: Containerized judge service with resource limits
- **Admin Panel**: Comprehensive admin interface for content management
- **User Dashboard**: Personalized problem recommendations and progress tracking
- **Contest System**: Timed competitions with leaderboards
- **Multi-language Support**: Support for multiple programming languages

## 🏗️ Architecture

```
CodeArena/
├── frontend/          # React.js application with Tailwind CSS
├── backend/           # Spring Boot REST API
├── judge/             # Containerized code execution service
├── docs/              # Project documentation
└── scripts/           # Utility scripts for development
```

## 🛠️ Tech Stack

### Frontend

- **React 18** with Hooks
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Firebase SDK** for authentication

### Backend

- **Spring Boot 3** with Java 17
- **Spring Security** with JWT
- **Spring Data JPA** for data access
- **MySQL** (Cloud SQL) for primary database
- **Firestore** for real-time data

### Infrastructure

- **Firebase Hosting** for frontend
- **Google Cloud Run** for backend services
- **Cloud SQL** for MySQL database
- **Cloud Storage** for file storage
- **Docker** for containerization

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Java** >= 17
- **Maven** >= 3.8
- **Docker** (for judge service)
- **Firebase CLI** (for deployment)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/codearena.git
cd codearena
```

### 2. Install Dependencies

```bash
# Install all dependencies (frontend + root)
pnpm install
```

### 3. Environment Setup

```bash
# Frontend environment
cp frontend/env.example frontend/.env.local
# Edit frontend/.env.local with your Firebase config

# Backend environment
cp backend/src/main/resources/application.properties backend/src/main/resources/application-dev.properties
# Edit backend/src/main/resources/application-dev.properties
```

### 4. Start Development Servers

```bash
# Start both frontend and backend
pnpm run dev:all

# Or start individually:
pnpm run dev          # Frontend only
pnpm run dev:backend  # Backend only
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/swagger-ui.html

## 📁 Project Structure

### Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/         # Page components
│   ├── services/      # API and Firebase services
│   ├── context/       # React context providers
│   ├── hooks/         # Custom React hooks
│   └── config/        # Configuration files
├── public/            # Static assets
└── dist/              # Build output
```

### Backend (`/backend`)

```
backend/
├── src/main/java/com/codearena/backend/
│   ├── controller/    # REST controllers
│   ├── service/       # Business logic
│   ├── repository/    # Data access layer
│   ├── entity/        # JPA entities
│   ├── dto/           # Data transfer objects
│   ├── config/        # Configuration classes
│   └── exception/     # Exception handlers
└── src/main/resources/
    └── application.properties
```

### Judge Service (`/judge`)

```
judge/
├── Dockerfile         # Container configuration
├── src/               # Judge service source code
└── config/            # Judge configuration
```

## 🧪 Testing

```bash
# Run all tests
pnpm run test:all

# Frontend tests only
pnpm run test

# Backend tests only
pnpm run test:backend
```

## 🏗️ Building

```bash
# Build all components
pnpm run build:all

# Frontend build only
pnpm run build

# Backend build only
pnpm run build:backend
```

## 🚀 Deployment

### Frontend (Firebase Hosting)

```bash
pnpm run deploy
```

### Backend (Google Cloud Run)

```bash
# Build and deploy to Cloud Run
gcloud run deploy codearena-backend \
  --source backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Judge Service (Google Cloud Run)

```bash
# Build and deploy judge service
gcloud run deploy codearena-judge \
  --source judge \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 🔧 Development Scripts

| Script                        | Description                       |
| ----------------------------- | --------------------------------- |
| `pnpm run dev`                | Start frontend development server |
| `pnpm run dev:backend`        | Start backend development server  |
| `pnpm run dev:all`            | Start both frontend and backend   |
| `pnpm run build`              | Build frontend for production     |
| `pnpm run test`               | Run frontend tests                |
| `pnpm run lint`               | Lint frontend code                |
| `pnpm run deploy`             | Deploy to Firebase Hosting        |
| `pnpm run firebase:emulators` | Start Firebase emulators          |

## 📚 Documentation

- [Firebase Setup Guide](FIREBASE_SETUP.md)
- [Backend API Documentation](backend/README.md)
- [Frontend Development Guide](frontend/README.md)
- [Judge Service Documentation](judge/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/codearena/issues)
- **Documentation**: [Project Wiki](https://github.com/your-username/codearena/wiki)
- **Email**: support@codearena.com

## 🙏 Acknowledgments

- Firebase team for authentication and hosting
- Google Cloud Platform for infrastructure
- React and Spring Boot communities
- All contributors and maintainers
