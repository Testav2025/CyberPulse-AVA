# Deployment

The application is designed to be deployed as a modern monorepo with a frontend app and API service.

## Recommended flow

1. Build the workspace with pnpm run build.
2. Deploy the API and web apps separately using your preferred hosting platform.
3. Configure the required environment variables, especially DATABASE_URL.
