import { Config } from './Config';
import { RuleConfig } from './RuleConfig';

export type Module = {
  path: string;
  name: string;
  config: Config;
  enabledRules: Record<string, RuleConfig>;
};
