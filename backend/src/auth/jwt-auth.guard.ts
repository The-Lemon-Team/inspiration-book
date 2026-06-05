import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { firstValueFrom, isObservable, Observable } from 'rxjs';

async function resolveCanActivate(
  result: boolean | Promise<boolean> | Observable<boolean>,
): Promise<boolean> {
  if (isObservable(result)) {
    return firstValueFrom(result);
  }
  return Promise.resolve(result);
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(err: unknown, user: TUser): TUser {
    if (err || !user) {
      throw err ?? new UnauthorizedException('Требуется авторизация');
    }
    return user;
  }
}

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return resolveCanActivate(super.canActivate(context) as boolean | Promise<boolean> | Observable<boolean>)
      .then(() => true)
      .catch(() => true);
  }

  handleRequest<TUser>(_err: unknown, user: TUser): TUser | null {
    return user ?? null;
  }
}
