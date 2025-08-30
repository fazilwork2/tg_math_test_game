import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BotModule } from './bot/bot.module';
import { ConfigModule } from '@nestjs/config';
import { User } from './bot/schema/user-schem';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'ardaa4gg',
      database: 'telegramdaa',
      models: [User],
      autoLoadModels: true,
      synchronize: true,
      logging: false,
      sync: { alter: true },
    }),
    BotModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
