import { Logger } from '@nestjs/common';
import { WaterfallDialog } from 'botbuilder-dialogs';

/** Dialog base to use with all the dialogs in the bot */
export class BaseDialog extends WaterfallDialog {
  protected logger: Logger;

  constructor(dialogId: string) {
    super(dialogId);

    this.logger = new Logger((this as any).constructor.name, false);

    // Get the steps reistered by the decorator @Step and add it to the waterfall
    for (const step of Reflect.getMetadata('steps', this) || []) {
      const method = this[step.propertyKey].bind(this);
      this.addStep(method);
    }
  }
}
