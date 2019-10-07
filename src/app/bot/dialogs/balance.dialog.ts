import { Dialog, Step } from '../decorators';
import { DialogId, Intent } from '../enums';
import { IStepContext } from '../interfaces';
import { BaseDialog } from './base.dialog';

@Dialog({ dialogId: DialogId.balance, intent: Intent.balance })
export class BalanceDialog extends BaseDialog {
  constructor() {
    super(DialogId.balance);
  }

  @Step(1)
  public async start(context: IStepContext) {
    await context.context.sendActivity('Je balans is 3000 euro');
    await context.endDialog();
  }
}
