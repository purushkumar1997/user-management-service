import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Constants } from '../common/constants';
import { Role } from '../entities/role.entity';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { JwtModule } from '@nestjs/jwt';
import { LoggerService } from 'src/logger/logger.service';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    JwtModule.register({
      global: true,
      secret: Constants.jwt_secret_key,
    }),
    LoggerModule,
  ],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
