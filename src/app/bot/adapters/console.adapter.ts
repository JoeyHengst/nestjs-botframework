import { Injectable } from '@nestjs/common';
import { ActivityTypes, BotAdapter, TurnContext } from 'botbuilder';
import * as readline from 'readline';
import { promisify } from 'util';

/** FROM Microsoft... with some changes... */
@Injectable()
export class ConsoleAdapter extends BotAdapter {
  private nextId = 0;
  private readonly reference;

  constructor() {
    super();
    this.nextId = 0;
    this.reference = {
      bot: { id: 'bot', name: 'Bot' },
      channelId: 'console',
      conversation: { id: 'convo1', name: '', isGroup: false },
      serviceUrl: '',
      user: { id: 'user', name: 'User1' }
    };
  }

  /**
   * Begins listening to console input. A function will be returned that can be used to stop the
   * bot listening and therefore end the process.
   *
   * @remarks
   * Upon receiving input from the console the flow is as follows:
   *
   * - An 'message' activity will be created containing the users input text.
   * - A revokable `TurnContext` will be created for the activity.
   * - The context will be routed through any middleware registered with [use()](#use).
   * - The bots logic handler that was passed in will be executed.
   * - The promise chain setup by the middleware stack will be resolved.
   * - The context object will be revoked and any future calls to its members will result in a
   *   `TypeError` being thrown.
   *
   * ```JavaScript
   * const closeFn = adapter.listen(async (context) => {
   *    const utterance = context.activity.text.toLowerCase();
   *    if (utterance.includes('goodbye')) {
   *       await context.sendActivity(`Ok... Goodbye`);
   *       closeFn();
   *    } else {
   *       await context.sendActivity(`Hello World`);
   *    }
   * });
   * ```
   * @param logic Function which will be called each time a message is input by the user.
   */
  public listen(logic) {
    const rl = this.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });
    rl.on('line', line => {
      // Initialize activity
      const activity = TurnContext.applyConversationReference(
        {
          id: (this.nextId++).toString(),
          text: line,
          timestamp: new Date(),
          type: ActivityTypes.Message
        },
        this.reference,
        true
      );
      // Create context and run middleware pipe
      const context = new TurnContext(this, activity);
      this.runMiddleware(context, logic).catch(err => {
        this.printError(err.toString());
      });
    });
    return () => {
      rl.close();
    };
  }

  /**
   * Lets a bot proactively message the user.
   *
   * @remarks
   * The processing steps for this method are very similar to [listen()](#listen)
   * in that a `TurnContext` will be created which is then routed through the adapters middleware
   * before calling the passed in logic handler. The key difference being that since an activity
   * wasn't actually received it has to be created.  The created activity will have its address
   * related fields populated but will have a `context.activity.type === undefined`.
   *
   * ```JavaScript
   * function delayedNotify(context, message, delay) {
   *    const reference = TurnContext.getConversationReference(context.activity);
   *    setTimeout(() => {
   *       adapter.continueConversation(reference, async (ctx) => {
   *          await ctx.sendActivity(message);
   *       });
   *    }, delay);
   * }
   * ```
   * @param reference A `ConversationReference` saved during a previous message from a user.  This can be calculated for any incoming activity using
   * `TurnContext.getConversationReference(context.activity)`.
   * @param logic A function handler that will be called to perform the bots logic after the the adapters middleware has been run.
   */
  public continueConversation(reference, logic) {
    // Create context and run middleware pipe
    const activity = TurnContext.applyConversationReference({}, reference, true);
    const context = new TurnContext(this, activity);
    return this.runMiddleware(context, logic).catch(err => {
      this.printError(err.toString());
    });
  }
  /**
   * Logs a set of activities to the console.
   *
   * @remarks
   * Calling `TurnContext.sendActivities()` or `TurnContext.sendActivity()` is the preferred way of
   * sending activities as that will ensure that outgoing activities have been properly addressed
   * and that any interested middleware has been notified.
   * @param context Context for the current turn of conversation with the user.
   * @param activities List of activities to send.
   */
  public async sendActivities(_: TurnContext, activities) {
    const responses = [];

    for (const activity of activities) {
      responses.push({});
      switch (activity.type) {
        case 'delay':
          promisify(setTimeout)(activity.value);
          break;
        case ActivityTypes.Message:
          if (activity.attachments && activity.attachments.length > 0) {
            const append =
              activity.attachments.length === 1
                ? `(1 attachment)`
                : `(${activity.attachments.length} attachments)`;
            this.print(`${activity.text} ${append}`);
          } else {
            this.print(activity.text || '');
          }
          break;
        default:
          this.print(`[${activity.type}]`);
          break;
      }
    }
    return responses;
  }

  /**
   * Not supported for the ConsoleAdapter.  Calling this method or `TurnContext.updateActivity()`
   * will result an error being returned.
   */
  public updateActivity() {
    return Promise.reject(new Error(`ConsoleAdapter.updateActivity(): not supported.`));
  }
  /**
   * Not supported for the ConsoleAdapter.  Calling this method or `TurnContext.deleteActivity()`
   * will result an error being returned.
   */
  public deleteActivity() {
    return Promise.reject(new Error(`ConsoleAdapter.deleteActivity(): not supported.`));
  }
  /**
   * Allows for mocking of the console interface in unit tests.
   * @param options Console interface options.
   */
  public createInterface(options) {
    return readline.createInterface(options);
  }
  /**
   * Logs text to the console.
   * @param line Text to print.
   */
  public print(line) {
    // tslint:disable-next-line:no-console
    console.log(line);
  }
  /**
   * Logs an error to the console.
   * @param line Error text to print.
   */
  public printError(line) {
    // tslint:disable-next-line:no-console
    console.error(line);
  }
}
