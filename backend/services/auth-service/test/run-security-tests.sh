#!/bin/bash

echo "🔐 Running Security Service Tests..."

# Set test environment
export NODE_ENV=test

# Run the security-focused tests
npm run test -- test/unit/security/security.service.spec.ts
npm run test -- test/unit/auth/auth.service.spec.ts

echo "✅ Security tests completed!"