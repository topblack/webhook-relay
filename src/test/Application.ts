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
    this.app.use(
      bodyParser.json({
        verify: (req: any, res, buf, encoding) => {
          if (buf && buf.length) {
            req.rawBodyAsString = buf.toString("utf8");
          }
        }
      })
    );

    this.app.use(
      bodyParser.urlencoded({
        extended: false,
        verify: (req: any, res, buf, encoding) => {
          if (buf && buf.length) {
            req.rawBodyAsString = buf.toString("utf8");
          }
        }
      })
    );
  };

  private handleEvent = (req: express.Request, res: express.Response) => {
    console.info(JSON.stringify(req.headers, null, 2));
    const evtType = req.params.evtType;
    if (!this.handlers.has(evtType)) {
      console.warn(`This test app doesn't support ${evtType}.`);
      return res.sendStatus(404);
    }

    this.handlers.get(evtType).handle(req)
      .then(() => res.sendStatus(200))
      .catch(err => {
        console.error(`Error occurred within the handler. ${err}`);
        res.status(500).send(err);
      });
  };

  public start = () => {
    const port = Config.getPort();
    console.info(`Listening ${port}`);
    this.app.listen(port);
  };
}
