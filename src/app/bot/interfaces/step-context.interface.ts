import { WaterfallStepContext } from 'botbuilder-dialogs';
import { IRecognitionResult } from './entity.interface';

export interface IStepContext
  extends WaterfallStepContext<{ recognitionResult: IRecognitionResult }> {}
