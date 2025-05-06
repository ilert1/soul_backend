import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [PrismaModule, TaskModule],
  controllers: [UserController],
  providers: [PrismaService, UserService],
})
export class UserModule {}
