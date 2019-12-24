import * as io from "socket.io-client";
import * as rest from "restler";

class TestSocketIO {

    private getToken = (): string => {
        // TODO, Encryption
        return `chemjenkins:123:${Date.now()}`;
    }

    public main() {

        let socket = io(`http://localhost:8080/chemjenkins?clientId=123&token=${this.getToken()}`);
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
        socket.on("github-webhook", (data: any) => {
            rest.postJson("http://localhost:8080/test", data.body, {
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