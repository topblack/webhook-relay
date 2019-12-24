import express from "express";
import bodyParser from "body-parser";

import { Config } from "../common/Config";
import { GitHubWebhookHandler } from "./GitHubWebhookHandler";

export class Application {
  private app = express();

  constructor() {
    this.setupMiddleaware();
    this.app.post("/:evtType", this.handleEvent);
  }

  private setupMiddleaware = () => {
    this.app.use(bodyParser.urlencoded({ extended: true }));
  };

  private handleEvent = (req: any, res: any) => {
    const evtType = req.params.evtType;

    if (evtType === "github") {
      new GitHubWebhookHandler({
        webhookSecret: ""
      })
        .handle(req)
        .then(() => res.sendStatus(200))
        .catch(err => {
          res.status(500).send(err);
        });
    } else {
        console.info(evtType);
        console.info(JSON.stringify(req.headers, null, 2));
        console.info(req.body);
        return res.sendStatus(404);
    }
  };

  public start = () => {
    const port = Config.getPort();
    console.info(`Listening ${port}`);
    this.app.listen(port);
  };
}
