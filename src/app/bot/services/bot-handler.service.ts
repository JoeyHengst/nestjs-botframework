import { environment } from '@app/environment';
import { Injectable, Logger } from '@nestjs/common';
import { ActivityHandler, TurnContext } from 'botbuilder';
import { DialogContext, DialogTurnStatus } from 'botbuilder-dialogs';
// import UniversalConnectorClient from 'universal-connector-client';
import { DialogId } from '../enums';
import { DialogFlowRecognizer } from '../recognizers';
import { BotService } from './bot.service';

@Injectable()
export class BotHandlerService extends ActivityHandler {
  private readonly logger = new Logger(BotHandlerService.name);

  constructor(
    // private universalClientAdapter: UniversalConnectorClient.UniversalClientAdapter,
    private readonly botService: BotService,
    private readonly dialogFlowRecognizer: DialogFlowRecognizer
  ) {
    super();

    this.onMessage(this.messageReceived.bind(this));
    this.onMembersAdded(this.newUser.bind(this));
    this.onDialog(this.dialogFinalyzed.bind(this));

    this.logger.debug('Say "quit" to end.');
    // this.universalClientAdapter.listen((context: TurnContext) => this.run(context));
    // this.universalClientAdapter.register(
    //   'user',
    //   environment.port, (turnContext: TurnContext) => this.run(turnContext)).then(() => this.logger.debug('Connected to master'));
  }

  private async newUser(context: TurnContext, next) {
    const membersAdded = context.activity.membersAdded;
    for (const member of membersAdded) {
      if (member.id !== context.activity.recipient.id) {
        await context.sendActivity('Welkom!');
      }
    }
    await next();
  }

  private async messageReceived(context: TurnContext, next: () => Promise<void>) {
    const dialogContext = await this.botService.dialogSet.createContext(context);
    const results = await dialogContext.continueDialog();
    this.logger.debug(`Dialog continued with status ${results.status}`);
    if (results.status === DialogTurnStatus.empty) {
      await this.recognizeMessage(context, dialogContext);
    }
    await next();
  }

  private async recognizeMessage(context: TurnContext, dialogContext: DialogContext) {
    const recognitionResult = await this.dialogFlowRecognizer.recognize(context);
    const dialogOfIntent = this.botService.intentMap[recognitionResult.intent];
    if (dialogOfIntent) {
      this.logger.debug(dialogOfIntent);
      await dialogContext.beginDialog(dialogOfIntent, { recognitionResult });
    } else {
      await dialogContext.beginDialog(DialogId.default, { recognitionResult });
    }
  }

  private async dialogFinalyzed(turnContext, next) {
    await this.botService.conversationState.saveChanges(turnContext, false);
    await this.botService.userState.saveChanges(turnContext, false);
    await next();
  }
}
