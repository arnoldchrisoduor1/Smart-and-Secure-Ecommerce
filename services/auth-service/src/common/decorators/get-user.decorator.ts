import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const requet = ctx.switchToHttp().getRequest();
        return request.user;
    },
)