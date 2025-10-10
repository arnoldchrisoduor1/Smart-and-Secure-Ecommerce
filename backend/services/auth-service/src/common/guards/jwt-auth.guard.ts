import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'; // <-- 🚨 Fix: Import Cache type
import { AuthGuard } from '@nestjs/passport';

// ❌ Removed: import * as cacheManager from 'cache-manager'; 
// Use the NestJS-provided 'Cache' type instead.

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    // 🚨 Fix: Use the NestJS-provided 'Cache' type for dependency injection
    constructor(@Inject(CACHE_MANAGER) private cacheManagaer: Cache) {
        super();
    }

    async canActivate(context: any): Promise<boolean> {
        // Run the base authentication logic (validate JWT)
        const result = (await super.canActivate(context)) as boolean;

        if (result) {
            const request = context.switchToHttp().getRequest();
            // Assuming 'request.user' is set by the JwtStrategy
            const user = request.user; 

            // Check if the token is blacklisted in Redis
            const isBlacklisted = await this.isTokenBlacklisted(user.id);
            if (isBlacklisted) {
                // If blacklisted, deny access
                throw new UnauthorizedException('Token has been revoked or expired.');
            }
        }
        return result;
    }

    /**
     * Checks the Redis blacklist for any keys related to the user's ID.
     * This requires access to the underlying Redis client's KEYS command.
     */
    private async isTokenBlacklisted(userId: string): Promise<boolean> {
        
        // 🚨 FIX FOR: this.cacheManagaer.store.keys(...)
        // In modern cache-manager (v5+), the store property has a different shape.
        // We use type casting and access the underlying client to run Redis-specific commands.

        try {
            // Access the underlying Keyv/Redis client. 
            // The exact way to access the client can vary, but this is a common pattern for Keyv/NestJS.
            const store = this.cacheManagaer.store;
            const client = (store as any).getClient ? (store as any).getClient() : store;

            // Execute the Redis KEYS command directly.
            // Note: KEYS can be slow in production; consider using SCAN if possible.
            const keys: string[] = await client.keys(`blacklist:${userId}:*`);

            return keys && keys.length > 0;
            
        } catch (error) {
            // Log the error but treat the token as valid to prevent a DOS attack 
            // if Redis is down, or throw if required by security policy.
            console.error('Redis blacklist check failed:', error);
            return false;
        }
    }
}