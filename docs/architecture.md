# Architecture

CyberPulse AVA is organized around a frontend application, an API service, and shared packages for data access and integration logic.

## Components

- apps/web — Vite + React UI
- apps/api — Express API layer
- packages/db — Drizzle schema and database access
- packages/integrations — external integration clients
- packages/api-spec — OpenAPI definitions
