# CodeArena Documentation

## Project Vision

A full-stack web-based competitive programming platform with robust admin and user interfaces, real-time features, and scalable cloud-native architecture.

## Tech Stack

- **Frontend:** ReactJS
- **Backend:** Spring Boot (Java)
- **Judge Service:** Containerized, multi-language support
- **Database:** Google Cloud MySQL (Cloud SQL), Cloud Firestore
- **Hosting:** Firebase Hosting, Google Cloud Run/App Engine

## Architecture Overview

- Modular monorepo structure: `frontend`, `backend`, `judge`
- Real-time updates via Firestore
- Secure, sandboxed code execution via judge service
- Scalable and cost-efficient cloud deployment

## Setup Instructions

- See individual `README.md` files in each directory for setup steps.
- Node version: see `.nvmrc`
- Use `pnpm` for Node.js package management

## Contribution Guidelines

- Write clear, concise code and documentation
- Use doc blocks for all components, classes, and schemas
- Update relevant `README.md` and `/docs` as features are added

## Documentation Index

- [Frontend README](../frontend/README.md)
- [Backend README](../backend/README.md)
- [Judge Service README](../judge/README.md)
