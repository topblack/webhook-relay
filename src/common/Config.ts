export class Config {
  static getPort(): number {
    const port = process.env.INNER_CONTAINER_PORT || process.env.APP_PORT || "3000";
    return parseInt(port, 10);
  }

  static getFieldKey(): string {
    return process.env.APP_FIELD_KEY || "default";
  }

  static getInternalAgentId(): string {
    return process.env.APP_INTAGENT_ID || "default";
  }

  static getExternalAgentUrl(): string {
    return process.env.APP_EXTAGENT_URL || "http://localhost:8080";
  }

  static getInternalForwardUrl(): string {
    return process.env.APP_INTFORWARD_URL || "http://localhost:8080";
  }
}
