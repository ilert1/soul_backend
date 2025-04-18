import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';
import { UserService } from 'src/modules/user/user.service';
import { CurrentUser } from '../../types/current-user';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: CurrentUser }>();
    const isRefreshRoute = request.url.startsWith('/api/auth/refresh'); // проверяем, что это путь для refresh

    // Если это путь для refresh, пропускаем JwtAuthGuard
    if (isRefreshRoute) return true;

    // Проверяем, является ли путь public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Если это путь для public, пропускаем JwtAuthGuard
    if (isPublic) return true;

    // Вызываем родительский метод canActivate для проверки JWT
    const canActivate = await super.canActivate(context);

    if (!canActivate) {
      return false;
    }

    // Получаем пользователя из запроса
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Пользователь не авторизован');
    }

    // Проверяем активность пользователя
    const dbUser = await this.userService.findOne(user.id);

    if (!dbUser.isActive) {
      throw new ForbiddenException('Пользователь заблокирован');
    }

    return true;
  }
}
