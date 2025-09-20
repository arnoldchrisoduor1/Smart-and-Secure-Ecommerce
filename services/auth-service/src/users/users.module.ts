import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, RefreshToken])],
    providers: [UsersService],
    exports: [UsersService],
})

export class UsersModule {}