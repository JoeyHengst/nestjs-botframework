import { Module, NestModule } from '@nestjs/common';
import { ConsoleAdapter } from './adapters';
import { BotController } from './controllers';
import { BalanceDialog, ChangeLanguageDialog, DefaultDialog } from './dialogs';
import { BotHandlerService, BotService } from './services';
import { DialogFlowRecognizer } from './recognizers';

@Module({
  controllers: [BotController],
  imports: [],
  providers: [
    BotHandlerService,
    ConsoleAdapter,
    BotService,
    DialogFlowRecognizer,
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
