import express = require("express");
import bodyParser = require("body-parser");
import { Config } from "../common/Config";

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const allowedFieldKeys: string[] = [
    Config.getFieldKey()
];

interface Socket {
    id: string;
    handshake: { address: string };
}

class ClientSpace {
    name: string;
    nsp: any;
    clients: Socket[];

    constructor(name: string, nsp: any) {
        this.name = name;
        this.nsp = nsp;
        this.clients = [];
    }

    public registerClient(client: Socket) {
        this.unregisterClient(client.id);
        this.clients.push(client);
        console.info("Registered " + client.handshake.address);
    }

    public unregisterClient(id: string) {
        let idToRemove: number = -1;
        for (let i = 0; i < this.clients.length; i++) {
            if (this.clients[i].id === id) {
                idToRemove = i;
                break;
            }
        }

        if (idToRemove >= 0) {
            console.info("Unregistered " + this.clients[idToRemove].handshake.address);
            this.clients.splice(idToRemove, 1);
        }
    }
}


export class Agent {
    private clientSpaces: ClientSpace[] = [];

    private forwardEvent(fieldKey: string, data: any) {
        let emitted = false;
        for (let client of this.clientSpaces) {
            if (client.name === fieldKey) {
                console.info("Forwarding data to " + fieldKey);
                client.nsp.emit("forward", data);
                emitted = true;
                break;
            }
        }

        if (!emitted) {
            throw new Error("NoSuchClientFound")
        }
    }

    public serve(port: number): void {
        app.use(bodyParser.json());

        app.post("/fields/:fieldKey", (req: any, res: any) => {
            this.forwardEvent(req.params.fieldKey, { headers: req.headers, body: req.body });

            try {
                res.sendStatus(200);
            } catch (error) {
                res.status(500).send(error);
            }
        });

        app.post("/test", (req: any, res: any) => {
            console.info(JSON.stringify(req.headers));
            console.info(req.body);
            res.sendStatus(200);
        });

        io.on("connection", (socket: any) => {
            console.info("connection");
        });

        for (let fieldKey of allowedFieldKeys) {
            let nsp = io.of("/" + fieldKey);
            let clientSpace = new ClientSpace(fieldKey, nsp);
            console.info(fieldKey);
            this.clientSpaces.push(clientSpace);
            nsp.on("connection", (socket: any) => {
                clientSpace.registerClient(socket);
                socket.on("disconnect", () => {
                    clientSpace.unregisterClient(socket.id);
                });
            });

            nsp.use((socket, next) => {
                const clientId = socket.handshake.query.clientId;
                const token = socket.handshake.query.token;
                try {
                    if (clientId && token) {
                        // Decryption here
                        console.info(token);
                        const segs = token.split(":");
                        const tokenTime = parseInt(segs[2], 10);
                        const timespan = Math.abs(tokenTime - Date.now());
                        if (segs[0] === fieldKey && segs[1] === clientId) {
                            if (timespan <= 5 * 60 * 1000) {
                                return next();
                            } else {
                                console.info("Invalid timestamp");
                            }
                        }
                    }
                } catch (error) {
                    console.error(error);
                }

                console.info("Authentication error");
                return next(new Error("authentication error"));
            });
        }

        console.info("Listening " + port + "...");
        server.listen(port);
    }
}
