import * as io from "socket.io-client";
import * as rest from "restler";
import { Config } from "../common/Config";

class TestSocketIO {

    private getToken = (): string => {
        // TODO, Encryption
        return `${Config.getFieldKey()}:${Config.getInternalAgentId()}:${Date.now()}`;
    }

    public main() {

        let socket = io(`${Config.getExternalAgentUrl()}/${Config.getFieldKey()}?clientId=${Config.getInternalAgentId()}&token=${this.getToken()}`);
        socket.on("connect", (sock: any) => {
            console.info("Connected");
        });
        socket.on("reconnect", (sock: any) => {
            console.info("Reconnecting");
        });
        socket.on("disconnect", (sock: any) => {
            console.info("Disconnected");
        });
        socket.on("reconnect_attempt", () => {
            socket.io.opts.query = {
              token: this.getToken()
            }
        });
        socket.on("forward", (data: any) => {
            console.info(data.body);
            rest.postJson(Config.getInternalForwardUrl(), data.body, {
                headers: data.headers
            }).on("complete", (data, response) => {
                if (response.statusCode === 200) {
                    console.info("DONE")
                }
            });
        });
    }
}

new TestSocketIO().main();