import { Module } from "./Module";
import { Config } from "./Config";
import { RuleResult } from "./RuleResult";

export interface Rule {
    checkModules(modules: Module[], baseDir:string): RuleResult[] | null;
    check(baseDir:string, config?: Config): RuleResult[] | null;
    name:string
}
