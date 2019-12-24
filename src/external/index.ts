import { Agent } from "./Agent";
import { Config } from "../common/Config";

new Agent().serve(Config.getPort());