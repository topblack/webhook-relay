import express = require("express");
import bodyParser = require("body-parser");

import { Config } from "../common/Config";
import { GitHubWebhookHandler } from "./GitHubWebhookHandler";
import { TestHandler } from "./TestHandler";

export class Application {
  private app = express();

  private handlers: Map<string, TestHandler>;

  constructor() {
    this.setupMiddleaware();
    this.app.post("/:evtType", this.handleEvent);
    this.initalizeHandlers();
  }

  private initalizeHandlers = () => {
    this.handlers = new Map<string, TestHandler>();
    this.handlers.set("github", new GitHubWebhookHandler({
      webhookSecret: process.env.APP_WEBHOOK_SECRET
    }));
  }

  private setupMiddleaware = () => {
    this.app.use(bodyParser.json());
  };

  private handleEvent = (req: express.Request, res: express.Response) => {
    console.info(JSON.stringify(req.headers, null, 2));
    const evtType = req.params.evtType;
    if (!this.handlers.has(evtType)) {
      return res.sendStatus(404);
    }

    this.handlers.get(evtType).handle(req)
      .then(() => res.sendStatus(200))
      .catch(err => {
        res.status(500).send(err);
      });
  };

  public start = () => {
    const port = Config.getPort();
    console.info(`Listening ${port}`);
    this.app.listen(port);
  };
}
