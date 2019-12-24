import * as crypto from "crypto";

import PQueue from "p-queue";
import { TestHandler } from "./TestHandler";

export interface GitHubWebhookHandlerInitParams {
  webhookSecret: string;
}

/**
 * Handle the GitHub webhook.
 */
export class GitHubWebhookHandler implements TestHandler {
  private githubWebhookHmacSecret: string;

  protected queue = new PQueue({ concurrency: 1 });

  constructor(params: GitHubWebhookHandlerInitParams) {
    this.githubWebhookHmacSecret = params.webhookSecret;
  }

  private verifyWebhookSignature = (webhookRequest: any) => {
    if (!this.githubWebhookHmacSecret) {
      return;
    }

    const hmac = crypto.createHmac("sha1", this.githubWebhookHmacSecret);
    const evtSig = webhookRequest.get("X-Hub-Signature") as string;
    if (!evtSig) {
      throw new Error("X-Hub-Signature is not found.");
    }

    hmac.update(webhookRequest.rawBodyAsString, "utf8");
    const hmacSig = hmac.digest("hex");
    if (evtSig.localeCompare("sha1=" + hmacSig) !== 0) {
      throw new Error("Webhook signature does not match.");
    }
  };

  public handle(webhookRequest: any): Promise<void> {
    return this.queue.add(() => {
      this.verifyWebhookSignature(webhookRequest);
      const evtType = webhookRequest.get("X-GitHub-Event") as string;
      console.info(evtType);
      console.info(webhookRequest.body);
    });
  }
}