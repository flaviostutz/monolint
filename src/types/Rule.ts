import { Module } from "./Module";
import { Config } from "./Config";
import { RuleResult } from "./RuleResult";

export interface Rule {
    name:string
    check(config: Config, modules: Module[]): RuleResult[];
}
