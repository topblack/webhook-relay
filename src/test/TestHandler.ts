
export interface TestHandler {
  handle(webhookRequest: any): Promise<void>;
}
