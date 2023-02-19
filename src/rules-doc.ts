/* eslint-disable no-console */
import fs from 'fs';

import { diffChars } from 'diff';

import { allRules } from './rules/registry';

const run = (processArgs: string[]): number => {
  let checkOnly = false;
  if (processArgs.length > 2 && processArgs[2] === '--check') {
    checkOnly = true;
  }

  let doc = '# Rules\n\n';
  doc += 'See below all rules that can be used for monorepo linting.\n\n';
  doc +=
    "Those configurations should be added to a file in the root of the monorepo called '.monolint.json'. If you create this file in intermediate folder (or even in the module folder), it will be merged to the root and default configurations also.\n";

  const rules = allRules.sort((aa, bb) => {
    if (aa.name < bb.name) {
      return -1;
    }
    return 1;
  });

  for (let i = 0; i < rules.length; i += 1) {
    const rule = rules[i];

    const ruleDocMarkdown = rule.docMarkdown();

    if (!ruleDocMarkdown || ruleDocMarkdown.length < 15) {
      console.log(`Doc markdown for rule ${rule.name} is too short`);
      return 1;
    }

    doc += '\n';
    doc += `## **${rule.name}**\n\n`;
    doc += `${ruleDocMarkdown}\n\n`;

    const examples = rule.docExampleConfigs();
    if (examples.length === 0) {
      console.log(`Examples for ${rule.name} is empty`);
      return 1;
    }
    if (examples.length > 0) {
      if (examples.length === 1) {
        doc += '- Example:\n\n';
      } else {
        doc += '- Examples:\n\n';
      }

      for (let j = 0; j < examples.length; j += 1) {
        const ex = examples[j];
        if (!ex.description || ex.description.length < 15) {
          console.log(`Example description for ${rule.name} -> example ${j + 1} is too short`);
          return 1;
        }
        doc += `\n  - ${ex.description}\n\n`;
        doc += '```json\n';
        const econf = { rules: <Record<string, any>>{} };

        if (typeof ex.config === 'undefined') {
          console.log(`Example config for ${rule.name} -> example ${j + 1} must be defined`);
          return 1;
        }
        econf.rules[`${rule.name}`] = ex.config;
        doc += `${JSON.stringify(econf, null, 2)}\n`;
        doc += '```\n';
      }
    }
  }

  if (checkOnly) {
    const cf = fs.readFileSync('rules.md', 'utf8');
    const diffs = diffChars(cf, doc);
    if (diffs.length > 1) {
      console.error('rules.md file is outdated. run "make rules-doc"');
      return 1;
    }
    console.log('rules.md file is up to date');
  } else {
    fs.writeFileSync('rules.md', doc, 'utf-8');
    console.log('rules.md created succesfully');
  }
  return 0;
};

const exitCode = run(process.argv);
if (exitCode !== 0) {
  process.exit(exitCode);
}

export { run };
