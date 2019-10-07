export interface IRecognitionResult {
  score: number;
  intent: string;
  entities: { [entityName: string]: any };
  text: string;
}
