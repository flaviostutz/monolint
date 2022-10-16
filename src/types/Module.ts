import { Config } from "./Config";
import { Rule } from "./Rule";

export type Module = {
    path: string,
    name: string,
    config: Config,
    enabledRules: Rule[]
}
