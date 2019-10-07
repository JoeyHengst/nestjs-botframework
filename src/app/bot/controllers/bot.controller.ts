import { Controller, Post, Req } from '@nestjs/common';
import { BotFrameworkAdapter, TurnContext } from 'botbuilder';
import { BotHandlerService } from '../services';

@Controller('api/v1/bot')
export class BotController {
  private readonly botFrameworkAdapter: BotFrameworkAdapter;
  constructor(private readonly botHandlerService: BotHandlerService) {
    this.botFrameworkAdapter = new BotFrameworkAdapter();
  }

  @Post('messages/bot-framework')
  public async botFrameworkMessages(@Req() req) {
    let body = {};
    const res = { status: () => 0, end: () => 0, send: data => (body = data) };
    await this.botFrameworkAdapter.processActivity(req, res, (turnContext: TurnContext) =>
      this.botHandlerService.run(turnContext)
    );
    return body;
  }
}
