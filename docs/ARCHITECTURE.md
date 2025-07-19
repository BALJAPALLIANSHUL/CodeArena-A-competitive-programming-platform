# CodeArena Architecture

## Overview

CodeArena is a microservices-based competitive programming platform designed for scalability, security, and real-time performance. The system follows a modern cloud-native architecture with clear separation of concerns.

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Judge Service │
│   (React)       │◄──►│  (Spring Boot)  │◄──►│   (Container)   │
│                 │    │                 │    │                 │
│ - User Interface│    │ - REST API      │    │ - Code Execution│
│ - Authentication│    │ - Business Logic│    │ - Sandboxing    │
│ - Real-time UI  │    │ - Data Access   │    │ - Resource Mgmt │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Firebase       │    │   Cloud SQL     │    │  Cloud Storage  │
│  Services       │    │   (MySQL)       │    │  (Test Cases)   │
│                 │    │                 │    │                 │
│ - Auth          │    │ - User Data     │    │ - Problem Files │
│ - Hosting       │    │ - Problems      │    │ - Submissions   │
│ - Firestore     │    │ - Submissions   │    │ - Results       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Component Details

### 1. Frontend (React + Vite)

**Technology Stack:**

- React 18 with Hooks
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- Firebase SDK for authentication

**Key Features:**

- Responsive design with mobile-first approach
- Real-time updates using Firestore
- Client-side routing with protected routes
- State management with React Context
- Progressive Web App capabilities

**Directory Structure:**

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page-level components
│   ├── services/      # API and Firebase services
│   ├── context/       # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   └── config/        # Configuration files
├── public/            # Static assets
└── dist/              # Build output
```

### 2. Backend (Spring Boot)

**Technology Stack:**

- Spring Boot 3 with Java 17
- Spring Security with JWT
- Spring Data JPA for data access
- MySQL (Cloud SQL) for primary database
- Firebase Admin SDK for authentication

**Key Features:**

- RESTful API design
- JWT-based authentication
- Role-based access control
- Data validation and sanitization
- Comprehensive error handling
- API documentation with Swagger

**Directory Structure:**

```
backend/
├── src/main/java/com/codearena/backend/
│   ├── controller/    # REST controllers
│   ├── service/       # Business logic layer
│   ├── repository/    # Data access layer
│   ├── entity/        # JPA entities
│   ├── dto/           # Data transfer objects
│   ├── config/        # Configuration classes
│   ├── exception/     # Exception handlers
│   └── util/          # Utility classes
└── src/main/resources/
    └── application.properties
```

### 3. Judge Service (Containerized)

**Technology Stack:**

- Docker containers for isolation
- Multi-language support (Java, Python, C++, JavaScript)
- Resource limiting and monitoring
- Secure execution environment

**Key Features:**

- Sandboxed code execution
- Configurable resource limits
- Support for multiple programming languages
- Real-time execution monitoring
- Integration with Cloud Storage for test cases

**Security Measures:**

- Container isolation
- Network restrictions
- File system limitations
- Process monitoring
- Resource usage limits

### 4. Data Storage

#### Primary Database (Cloud SQL - MySQL)

- **User Management**: User profiles, authentication data
- **Problem Management**: Problem definitions, test cases
- **Submission Tracking**: Code submissions, results
- **Contest Management**: Contest data, participants

#### Real-time Database (Firestore)

- **Live Submissions**: Real-time submission status
- **Leaderboards**: Live contest rankings
- **User Presence**: Online user tracking
- **Notifications**: Real-time user notifications

#### File Storage (Cloud Storage)

- **Test Cases**: Problem input/output files
- **User Submissions**: Submitted code files
- **Problem Assets**: Images, attachments
- **Backup Data**: System backups

## Security Architecture

### Authentication & Authorization

1. **Firebase Authentication**: Primary user authentication
2. **JWT Tokens**: Session management and API access
3. **Role-based Access Control**: Admin, User, Judge roles
4. **Token Verification**: Backend validates Firebase tokens

### Data Security

1. **Encryption**: All sensitive data encrypted at rest
2. **HTTPS**: All communications encrypted in transit
3. **Input Validation**: Comprehensive input sanitization
4. **SQL Injection Prevention**: Parameterized queries

### Code Execution Security

1. **Container Isolation**: Each submission runs in isolated container
2. **Resource Limits**: CPU, memory, and time restrictions
3. **Network Restrictions**: No external network access
4. **File System Restrictions**: Limited file system access

## Scalability Design

### Horizontal Scaling

- **Stateless Services**: Backend and judge services are stateless
- **Load Balancing**: Cloud Run provides automatic load balancing
- **Database Scaling**: Cloud SQL supports read replicas
- **Caching**: Redis for session and data caching

### Performance Optimization

- **CDN**: Firebase Hosting provides global CDN
- **Database Indexing**: Optimized database queries
- **Connection Pooling**: Efficient database connections
- **Async Processing**: Non-blocking operations

## Deployment Architecture

### Development Environment

```
Local Development:
├── Frontend: http://localhost:5173
├── Backend: http://localhost:8080
├── Judge: http://localhost:8081
├── MySQL: localhost:3306
└── Redis: localhost:6379
```

### Production Environment

```
Google Cloud Platform:
├── Frontend: Firebase Hosting
├── Backend: Cloud Run
├── Judge: Cloud Run
├── Database: Cloud SQL
├── Storage: Cloud Storage
└── Cache: Memorystore (Redis)
```

## Monitoring & Observability

### Logging

- **Structured Logging**: JSON format logs
- **Centralized Logging**: Cloud Logging
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Request/response timing

### Metrics

- **Application Metrics**: Custom business metrics
- **Infrastructure Metrics**: CPU, memory, disk usage
- **User Metrics**: Active users, submissions, problems
- **Performance Metrics**: Response times, throughput

### Alerting

- **Error Alerts**: Critical error notifications
- **Performance Alerts**: Slow response time alerts
- **Resource Alerts**: High resource usage alerts
- **Security Alerts**: Suspicious activity alerts

## API Design

### RESTful Endpoints

```
Authentication:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/verify
POST   /api/auth/logout

Users:
GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/{id}

Problems:
GET    /api/problems
GET    /api/problems/{id}
POST   /api/problems
PUT    /api/problems/{id}
DELETE /api/problems/{id}

Submissions:
POST   /api/submissions
GET    /api/submissions/{id}
GET    /api/submissions/user/{userId}

Contests:
GET    /api/contests
GET    /api/contests/{id}
POST   /api/contests
PUT    /api/contests/{id}
```

### Response Format

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Future Enhancements

### Planned Features

1. **Microservices**: Further service decomposition
2. **Event Sourcing**: For audit trails and analytics
3. **GraphQL**: Alternative to REST API
4. **WebSocket**: Real-time communication
5. **Machine Learning**: Problem recommendations

### Scalability Improvements

1. **Kubernetes**: Container orchestration
2. **Service Mesh**: Istio for service communication
3. **Distributed Tracing**: Jaeger for request tracing
4. **Circuit Breakers**: Resilience patterns
5. **Rate Limiting**: API protection
