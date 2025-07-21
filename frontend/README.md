# Frontend (ReactJS)

## Purpose

The user-facing web application for CodeArena, built with ReactJS. Handles registration, problem-solving, contests, recommendations, and progress tracking.

## Structure

- `/src/components` – Reusable UI components
- `/src/pages` – Main pages/routes
- `/src/services` – API and utility functions
- `/src/assets` – Static files (images, styles)

## Setup

1. Ensure Node.js version matches `.nvmrc`
2. Install dependencies: `pnpm install`
3. Start dev server: `pnpm run dev`

## Conventions

- Use functional components and hooks
- Document each component with JSDoc-style comments
- Keep UI clean and modular

## Authentication Flow

- User registers via Firebase Auth (email, password, display name).
- After successful registration, the frontend calls the backend `/api/auth/register` endpoint to create a user role.
- Passwords are managed by Firebase only and never sent to the backend.
