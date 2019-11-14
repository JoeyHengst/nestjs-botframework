import { constants } from '../../../constants';
import { Injectable, Logger } from '@nestjs/common';
import {
  ConversationState,
  MemoryStorage,
  StatePropertyAccessor,
  TurnContext,
  UserState
} from 'botbuilder';
import { ChoicePrompt, DialogSet } from 'botbuilder-dialogs';
import { MongoStorage } from 'botbuilder-storage-mongodb';
import { DialogId } from '../enums';
import { IProfile } from '../interfaces';

@Injectable()
export class BotService {
  public conversationState: ConversationState;
  public userState: UserState;
  public userProfile: StatePropertyAccessor<IProfile>;
  public dialogSet: DialogSet;
  public intentMap: { [intentName: string]: string } = {};

  private readonly storage: MongoStorage;
  private readonly userProfileProperty = 'userProfile';
  private readonly logger = new Logger(BotService.name);

  constructor() {
    this.storage = new MemoryStorage();
    // Replace the storage with this to use a DB
    /* this.storage = new MongoStorage(
      environment.bot.storage.uri,
      environment.bot.storage.database,
      environment.bot.storage.collection,
    ); */
    // This is the memory, 3 types: Conversation level (different users). User level (Only to the user)
    this.conversationState = new ConversationState(this.storage);
    this.userState = new UserState(this.storage);
    this.userProfile = this.userState.createProperty(this.userProfileProperty);

    const dialogState = this.conversationState.createProperty('dialogState');
    this.dialogSet = new DialogSet(dialogState);
  }

  public configureDialogs() {
    const dialogs = Reflect.getMetadata('dialogs', BotService) || [];
    this.intentMap = Reflect.getMetadata('intents', BotService) || [];
    // Add dialogs
    for (const dialog of dialogs) {
      this.logger.log(`Dialog registered {${dialog.dialogId}}`);
      this.dialogSet.add(constants.app.get(dialog.constructor));
    }

    // Add default prompts
    this.dialogSet.add(new ChoicePrompt(DialogId.choicePrompt));
  }

  public getProfile(context: TurnContext) {
    return this.userProfile.get(context, { language: 'nl' });
  }
}
