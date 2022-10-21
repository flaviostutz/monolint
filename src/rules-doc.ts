import fs from 'fs';

import { diffChars } from 'diff';

import { allRules } from './rules/registry';

let checkOnly = false;
if (process.argv.length > 2 && process.argv[2] === '--check') {
  checkOnly = true;
}

let doc = '# Rules\n\n';
doc += 'See below all rules that can be used for monorepo linting.\n\n';
doc +=
  "Those configurations should be added to a file in the root of the monorepo called '.monolint.json'. If you create this file in intermediate folder (or even in the module folder), it will be merged to the root and default configurations also.\n";

const rules = allRules.sort((aa, bb) => {
  if (aa < bb) {
    return 1;
  }
  return -1;
});

for (let i = 0; i < rules.length; i += 1) {
  const rule = rules[i];
  doc += '\n';
  doc += `## **${rule.name}**\n\n`;
  doc += `${rule.docMarkdown()}\n\n`;

  const examples = rule.docExampleConfigs();
  if (examples.length > 0) {
    if (examples.length === 1) {
      doc += '* Example:\n\n';
    } else {
      doc += '* Examples:\n\n';
    }
    for (let j = 0; j < examples.length; j += 1) {
      const ex = examples[j];
      doc += `\n  * ${ex.description}\n\n`;
      doc += '```json\n';
      const econf = { rules: <Record<string, any>>{} };
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
    diffs.forEach((part) => {
      console.log(part);
    });
    process.exit(1);
  }
} else {
  fs.writeFileSync('rules.md', doc, 'utf-8');
  console.log('rules.md created succesfully');
}
