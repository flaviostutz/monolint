import { Module } from "./Module";
import { Config } from "./Config";
import { RuleResult } from "./RuleResult";
import { RuleExample } from "./RuleExample";

export interface Rule {

    /**
     * Evaluate this rule against a set of modules
     * @param {Module[]} modules - All modules that have this rule enabled and must be checked
     * @param {string} baseDir - Base dir of the monorepo
     * @return {RuleResult[] | null} - If rule check was evaluated and you have a decision whatever
     *                                  it was valid or not, return an array of results.
     *                                  If this check didn't apply to these modules,
     *                                  or this rule doesn't check modules, simply
     *                                  return null to indicate that they were skipped
     */
    checkModules(modules: Module[], baseDir:string): RuleResult[] | null;

    /**
     * Evaluate this rule against the base of the repo. Used for checks outside modules.
     * @param {string} baseDir - Base dir of the monorepo
     * @param {Config} config - Base configuration (from basedir, not from inside modules)
     * @return {RuleResult[] | null} - If rule check was evaluated and you have a decision whatever
     *                                  it was valid or not, return an array of results.
     *                                  If this check didn't apply to the context or this
     *                                  rule doesn't support base checks, simply
     *                                  return null to indicate that they were skipped
     */
    check(baseDir:string, config?: Config): RuleResult[] | null;

    /**
     * Returns a documentation markdown for this rule
     * If you update this, make sure to run "make rules-doc" so
     * file "rules.md" with recent updates will be recreated
     */
    docMarkdown():string

    /**
     * Returns one or more examples of configurations
     */
     docExampleConfigs(): RuleExample[];

    /**
     * The name of this rule
     */
    name:string

}
