import Module from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SecurityService } from "./security.service";
import { SecurityEvent } from "./entities/security-event.entity";

@Module({
    imports: [TypeOrmModule.forFeature([SecurityEvent])],
    providers: [SecurityService],
    exports: [SecurityService],
})
export class SecurityModule {}