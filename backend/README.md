# Backend (Spring Boot)

## Purpose

The API and business logic for CodeArena, built with Spring Boot. Manages users, problems, contests, submissions, and integrates with databases and judge service.

## Structure

- `/src/main/java` – Java source code
  - `/controller` – REST controllers
  - `/service` – Business logic
  - `/repository` – Data access
  - `/model` – Data models/entities
- `/src/main/resources` – Config and static resources

## Setup

1. Ensure Java 17+ is installed
2. Import as Maven/Gradle project
3. Configure database connection (see `.env.example` or docs)
4. Run: `./mvnw spring-boot:run` or via IDE

## Conventions

- Use JavaDoc for all classes and methods
- Follow layered architecture
- Keep business logic in services

## Authentication & User Registration

- The backend does **not** store user passwords.
- Registration is a two-step process: users are created in Firebase Auth, then registered in the backend for role management.
- The backend expects `firebaseUid`, `email`, and `displayName` for registration.
