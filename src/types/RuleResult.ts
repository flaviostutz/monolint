import { Module } from './Module';

export type RuleResult = {
    resource: string,
    valid: boolean,
    rule?: string,
    message?: string,
    module?: Module
}
