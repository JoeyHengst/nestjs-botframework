import { ActionTypes } from 'botbuilder';
import { Dialog, Step } from '../decorators';
import { DialogId, Intent } from '../enums';
import { IStepContext } from '../interfaces';
import { BotService } from '../services';
import { BaseDialog } from './base.dialog';

@Dialog({ dialogId: DialogId.language, intent: Intent.language })
export class ChangeLanguageDialog extends BaseDialog {
  constructor(private readonly botService: BotService) {
    super(DialogId.language);
  }

  @Step(1)
  public async start(context: IStepContext) {
    return context.prompt(DialogId.choicePrompt, 'Selecteer een taal', [
      {
        value: 'nl',
        synonyms: ['nederlands', 'nederlands'],
        action: { title: 'Nederlands', value: 'nl', type: ActionTypes.ImBack }
      },
      {
        value: 'en',
        synonyms: ['english', 'english'],
        action: { title: 'English', value: 'en', type: ActionTypes.ImBack }
      }
    ]);
  }

  @Step(2)
  public async changeLanguage(context: IStepContext) {
    const profile = await this.botService.getProfile(context.context);
    profile.language = context.result.value;
    await context.context.sendActivity(`Je taal is veranderd naar: "${profile.language}"`);
    return context.endDialog();
  }
}
