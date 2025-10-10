# Start the catalog-service in watch mode
pnpm --filter catalog-service start:dev

# Start the auth-service in watch mode
pnpm --filter auth-service start:dev

# Start all services at once in parallel
pnpm start:all