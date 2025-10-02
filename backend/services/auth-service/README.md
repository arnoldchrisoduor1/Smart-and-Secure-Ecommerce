ATH listing
Volume serial number is 3AC3-D332
C:.
|   app.controller.spec.ts
|   app.controller.ts
|   app.module.ts
|   app.service.ts
|   main.ts
|   
+---auth
|   |   auth.controller.ts
|   |   auth.module.ts
|   |   auth.service.ts
|   |   
|   +---dto
|   |       auth.dto.ts
|   |
|   +---entities
|   |       refresh-token.entity.ts
|   |
|   \---strategies
|           jwt.strategy.ts
|           local.strategy.ts
|
+---common
|   +---decorators
|   |       get-user.decorator.ts
|   |
|   +---guards
|   |       jwt-auth.guard.ts
|   |       local-auth.guard.ts
|   |
|   \---health
|           health.controller.ts
|
+---config
|       database.config.ts
|       kafka.config.ts
|       redis.config.ts
|
+---events
|       events.module.ts
|       events.service.ts
|
+---security
|   |   security.module.ts
|   |   security.service.ts
|   |
|   \---entities
|           security-event.entity.ts
|
\---users
    |   users.module.ts
    |   users.service.ts
    |
    \---entities
            user.entity.ts