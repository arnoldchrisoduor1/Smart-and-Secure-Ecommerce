import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AuthGuard } from '@nestjs/passport';
import * as cacheManager from 'cache-manager';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(@Inject(CACHE_MANAGER) private cacheManagaer: cacheManager.Cache) {
        super();
    }

    async canActivate(context: any): Promise<boolean> {
        const result = await super.canActivate(context);

        if(result) {
            const request = context.switchToHttp().getRequest();
            const user = request.user;

            // check if token is blacklist.
            const isBlacklisted = await this.isTokenBlacklisted(user.id);
            if (isBlacklisted) {
                throw new UnauthorizedException('Token has been been revoked')
            }
        }
        return result as boolean;
    }

    
    private async isTokenBlacklisted(userId: string): Promise<boolean> {
        const keys = await this.cacheManagaer.store.keys(`blacklist:${userId}:*`);
        return keys && keys.length > 0;
    }
}