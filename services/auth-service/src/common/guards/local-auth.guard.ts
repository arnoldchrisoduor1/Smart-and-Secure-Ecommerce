import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passwort';


@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

