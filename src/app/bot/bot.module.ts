import { Module, NestModule } from '@nestjs/common';
import { ConsoleAdapter } from './adapters';
import { BotController } from './controllers';
import { BalanceDialog, ChangeLanguageDialog, DefaultDialog } from './dialogs';
import { BotHandlerService, BotService } from './services';

@Module({
  controllers: [BotController],
  imports: [],
  providers: [
    BotHandlerService,
    ConsoleAdapter,
    BotService,
    DefaultDialog,
    BalanceDialog,
    ChangeLanguageDialog
  ]
})
export class BotModule implements NestModule {
  constructor(private readonly botService: BotService) {}

  public configure() {
    this.botService.configureDialogs();
  }
}
