import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AvatarModule } from '../avatar/avatar.module';
import { AvatarService } from '../avatar/avatar.service';
import { ImageService } from '../image/image.service';
import { InviteService } from '../invite/invite.service';
import { LoggerModule } from '../logger/logger.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramUserModule } from '../telegramUser/telegramUser.module';
import { TransactionCreateService } from '../transaction/transaction-create.service';
import { UserService } from '../user/user.service';
import { WalletModule } from '../wallet/wallet.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import jwtConfig from './config/jwt.config';
import refreshJwtConfigCopy from './config/refresh-jwt.config';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { WsJwtGuard } from './guards/ws-jwt-auth/ws-jwt.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh.strategy';
import { ExperienceService } from '../experience/experience.service';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfigCopy),
    PrismaModule,
    WalletModule,
    LoggerModule,
    TelegramUserModule,
    AvatarModule,
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    AuthService,
    UserService,
    JwtStrategy,
    RefreshJwtStrategy,
    AvatarService,
    ImageService,
    InviteService,
    WsJwtGuard,
    TransactionCreateService,
    ExperienceService,
    // Добавляем JwtAuthGuard в список глобальных гардов
    // таким образом он будет применяться ко всем роутам
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [WsJwtGuard],
})
export class AuthModule {}
