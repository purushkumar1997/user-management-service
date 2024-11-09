import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Constants } from '../common/constants';
import { User } from 'src/entities/user.entity';
import { RoleModule } from 'src/role/role.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { Role } from 'src/entities/role.entity';
import { JwtService } from '@nestjs/jwt';
import { LoggerService } from 'src/logger/logger.service';
import { RoleService } from 'src/role/role.service';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    JwtModule.register({
      global: true,
      secret: Constants.jwt_secret_key,
    }),
    LoggerModule,
  ],
  controllers: [UserController],
  providers: [UserService, JwtService, RoleService],
})
export class UserModule {}
