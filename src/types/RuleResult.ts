import { Module } from './Module';

export type RuleResult = {

  /**
   * Path of the file evaluated
   */
  resource: string;

  /**
   * Whetever the resource comply to this rule or not
   */
  valid: boolean;

  /**
   * Name of the rule that generated this result
   */
  rule: string;

  /**
   * Details about the verification process, with indications
   * about what have to be fixed in the resource
   */
  message?: string;

  /**
   * Related module
   */
  module?: Module;
};
