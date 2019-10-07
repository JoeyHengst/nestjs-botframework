import { Dialog, Step } from '../decorators';
import { DialogId } from '../enums';
import { IStepContext } from '../interfaces';
import { BaseDialog } from './base.dialog';

@Dialog({ dialogId: DialogId.default })
export class DefaultDialog extends BaseDialog {
  constructor() {
    super(DialogId.default);
  }

  @Step(1)
  public async start(context: IStepContext) {
    const recognitionResult = context.options.recognitionResult;
    const responseEntity = recognitionResult.entities;
    if (responseEntity.response) {
      await context.context.sendActivity({ text: responseEntity.response });
    } else {
      await context.context.sendActivity('Geen antwoord');
    }
    await context.endDialog();
  }
}
