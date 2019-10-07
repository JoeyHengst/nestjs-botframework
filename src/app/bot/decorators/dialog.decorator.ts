import { BotService } from '../services';

/**
 * Define a class as a Dialog in botBuilder
 * @param options
 */
export function Dialog(options: { dialogId: string; intent?: string }): ClassDecorator {
  return constructor => {
    const dialogs = Reflect.getMetadata('dialogs', BotService) || [];
    dialogs.push({ dialogId: options.dialogId, constructor });
    Reflect.defineMetadata('dialogs', dialogs, BotService);

    if (options.intent) {
      const intents = Reflect.getMetadata('intents', BotService) || {};
      intents[options.intent] = options.dialogId;
      Reflect.defineMetadata('intents', intents, BotService);
    }
  };
}
