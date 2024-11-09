import { Module } from '@nestjs/common';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Constants } from '../common/constants';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: Constants.db_host,
      port: +Constants.port,
      username: Constants.db_username,
      password: Constants.db_password,
      database: Constants.db_name,
      entities: [join(__dirname, '../../dist/entities/**/*{.ts,.js}')],
      migrations: [join(__dirname, '../../dist/migrations/*{.ts,.js}')],
      synchronize: true,
      migrationsRun: true,
    }),
  ],
})
export class DatabaseModule {}
