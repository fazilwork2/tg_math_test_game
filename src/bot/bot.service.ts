import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import TelegramBot from 'node-telegram-bot-api';
import { User } from './schema/user-schem';
import { literal } from 'sequelize';

@Injectable()
export class BotService {
  private bot: TelegramBot;

  constructor(@InjectModel(User) private userModel: typeof User) {
    this.bot = new TelegramBot(process.env.TELEGRAM_TOKEN as string, {
      polling: true,
    });

    this.bot.setMyCommands([
      { command: 'math', description: 'бери вопрос' },
      { command: 'start', description: 'Start' },
      { command: 'top', description: 'топ играков' },
    ]);

    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const username = msg.from?.first_name || 'Anon';

      let user = await this.userModel.findOne({ where: { chat_id: chatId } });

      if (!user) {
        user = await this.userModel.create({
          chat_id: chatId,
          userName: username,
        });
      }
    });

    this.bot.onText(/\/math/, async (msg) => {
      const chatId = msg.chat.id;
      const a: number = Math.floor(Math.random() * 10);
      const b: number = Math.floor(Math.random() * 10);

      const result = a + b;

      await this.userModel.update(
        { lastAnswer: result },
        { where: { chat_id: chatId } },
      );

      this.bot.sendMessage(chatId, `Yech: ${a} + ${b} = ?`);
    });

    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;

      if (!text || text.startsWith('/')) return;

      const user = await this.userModel.findOne({ where: { chat_id: chatId } });
      if (!user || user.lastAnswer === null) return;

      const correctAnswer = user.lastAnswer;
      const userAnswer = parseInt(text, 10);

      if (userAnswer === correctAnswer) {
        this.bot.sendMessage(chatId, `правильно, ${user.userName}!`);
        await this.userModel.update(
          { scrol: literal('"scrol" + 1') },
          { where: { userName: msg.from?.first_name } },
        );
      } else {
        this.bot.sendMessage(
          chatId,
          `не правильно, ${user.userName}. а правльный : ${correctAnswer}`,
        );

        if (user?.scrol == undefined) {
          return this.bot.sendMessage(chatId, 'чтото пошло не так');
        }
        if (user?.scrol >= 0) {
          this.bot.sendMessage(
            chatId,
            `у вас нету балов так что вы не ушли в минус `,
          );
        }
      }

      await this.userModel.update(
        { lastAnswer: null },
        { where: { chat_id: chatId } },
      );
    });

    this.bot.onText(/\/top/, async (msg) => {
      const chatId = msg.chat.id;
      const page = 1;
      const limit = 5;

      const users = await this.userModel.findAll({
        order: [['scrol', 'DESC']],
        limit,
        offset: (page - 1) * limit,
      });

      const text =
        users.length > 0
          ? users
              .map((u, i) => `${i + 1}. ${u.userName} — ${u.scrol || 0} очков`)
              .join('\n')
          : 'Нет игроков';

      await this.bot.sendMessage(chatId, text, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '⬅ Назад', callback_data: `top:${page - 1}` },
              { text: 'Вперёд ➡', callback_data: `top:${page + 1}` },
            ],
          ],
        },
      });
    });

    this.bot.on('callback_query', async (query) => {
      const chatId = query.message?.chat.id;
      if (!chatId || !query.data) return;

      if (query.data.startsWith('top:')) {
        const page = parseInt(query.data.split(':')[1]);
        if (page < 1) return;

        const limit = 5;
        const users = await this.userModel.findAll({
          order: [['scrol', 'DESC']],
          limit,
          offset: (page - 1) * limit,
        });

        const text =
          users.length > 0
            ? users
                .map(
                  (u, i) =>
                    `${(page - 1) * limit + i + 1}. ${u.userName} — ${u.scrol || 0} очков`,
                )
                .join('\n')
            : 'Нет игроков';

        await this.bot.editMessageText(text, {
          chat_id: chatId,
          message_id: query.message?.message_id,
          reply_markup: {
            inline_keyboard: [
              [
                { text: '⬅ Назад', callback_data: `top:${page - 1}` },
                { text: 'Вперёд ➡', callback_data: `top:${page + 1}` },
              ],
            ],
          },
        });
      }
    });
  }
}
