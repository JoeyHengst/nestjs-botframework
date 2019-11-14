
import { Injectable, Logger } from '@nestjs/common';
import { TurnContext } from 'botbuilder';
import { DetectIntentResponse, SessionsClient } from 'dialogflow';
import { IRecognitionResult } from '../interfaces';
import { environment } from '../../environment';

@Injectable()
export class DialogFlowRecognizer {
  private logger = new Logger(DialogFlowRecognizer.name, false);
  private sessionClient;
  private projectId;
  private readonly jsonSimpleValueKinds = new Set(['numberValue', 'stringValue', 'boolValue']);

  constructor() {
    this.projectId = environment.dialogFlow.projectId;
    this.sessionClient = new SessionsClient();
  }

  public async recognize(turnContext: TurnContext): Promise<IRecognitionResult> {
    const utterance = turnContext.activity.text;
    const result = { score: 0.0, intent: null, entities: {}, text: utterance };
    if (utterance) {
      this.logger.log(`Try to recognize "${utterance}"`);
      const sessionId = `${turnContext.activity.from.id}-${turnContext.activity.channelId}`.substring(
        0,
        30
      );
      try {
        const data = await this.makeRequest(
          utterance,
          sessionId,
          turnContext.activity.locale || 'es'
        );
        return data;
      } catch (error) {
        this.logger.error(error);
      }
    }
    return result;
  }

  private async makeRequest(
    text: string,
    sessionId: string,
    languageCode: string
  ): Promise<IRecognitionResult> {
    const sessionPath = this.sessionClient.sessionPath(this.projectId, sessionId);
    const request = {
      queryInput: {
        text: {
          languageCode,
          text
        }
      },
      session: sessionPath
    };
    const data = (await this.sessionClient.detectIntent(request))[0];
    const processedData = this.processDialogFlowData(data);
    this.logger.log(`Recognized ${processedData.intent}`);
    return {
      ...processedData,
      score: data.queryResult.intentDetectionConfidence,
      text
    };
  }

  private processDialogFlowData(data: DetectIntentResponse) {
    const result: { entities: { [entityName: string]: any }; intent: string } = {
      entities: {},
      intent: null
    };
    if (!data.queryResult.intent) {
      result.intent = data.queryResult.action;
    } else {
      result.intent = data.queryResult.intent.displayName;
    }
    result.entities = this.structProtoToJson(data.queryResult.parameters);
    result.entities.response = data.queryResult.fulfillmentText;
    return result;
  }

  private structProtoToJson(proto) {
    if (!proto || !proto.fields) {
      return {};
    }
    const json = {};
    // tslint:disable-next-line:forin
    for (const k in proto.fields) {
      json[k] = this.valueProtoToJson(proto.fields[k]);
    }
    return json;
  }

  private valueProtoToJson(proto) {
    if (!proto || !proto.kind) {
      return null;
    }

    if (this.jsonSimpleValueKinds.has(proto.kind)) {
      return proto[proto.kind];
    }
    if (proto.kind === 'nullValue') {
      return null;
    }
    if (proto.kind === 'listValue') {
      return proto.listValue.values.map(this.valueProtoToJson.bind(this));
    }
    if (proto.kind === 'structValue') {
      return this.structProtoToJson(proto.structValue);
    }
    return null;
  }
}
