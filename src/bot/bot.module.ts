import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './schema/user-schem';

@Module({
  imports:[SequelizeModule.forFeature([User])],
  controllers: [],
  providers: [BotService],
})
export class BotModule {}
