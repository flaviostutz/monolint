import { Module } from "./Module";
import { Config } from "./Config";
import { RuleResult } from "./RuleResult";

export interface Rule {
    checkModule(module: Module): RuleResult[] | null;
    check(baseDir:string, config?: Config): RuleResult[] | null;
    name:string
}
