export class Config {
  static getPort(): number {
    const port = process.env.INNER_CONTAINER_PORT || process.env.APP_PORT || "3000";
    return parseInt(port, 10);
  }
}
