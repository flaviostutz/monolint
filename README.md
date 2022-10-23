# Monolint

[![This is a Poppins project](https://raw.githubusercontent.com/bancodobrasil/poppins/master/badge-poppins.svg)](https://github.com/bancodobrasil/poppins)
[![first-timers-only](https://img.shields.io/badge/first--timers--only-friendly-blue.svg?style=flat-square)](https://www.firsttimersonly.com/)

Linter for monorepos. Checks folder structure, module contents, file contents and naming conventions of a monorepo.

This tool will look for modules inside the repo (which are folders with a certain "marker file", like package.json). After discovering the module folders, it will run a set a rules to check if the modules are well structured and show the results.

Some example of the rules are: check if all modules are inside a certain folder, check if module names comply to a specific naming convention, check if certain file between modules have the same contents, check if github actions workflow name contains the name of the corresponding module...

## This is a friendly project for first-time contributors and open source beginners

This project follows the [Poppins manifesto guidelines](https://github.com/bancodobrasil/poppins) as part of it's community principles and policies, focusing all the decisions and interactions on providing open source beginners mentorship with real and relevant experiences, respecting each learning pace, background experience, academic formation, questions, suggestions, doubts and opinion.

## Contribute now!

So, let's start contributing! **Open an issue asking for a task to be done by you**. A mentor/maintainer will come and provide a technical overview of the project and what are the possibles ways of contributing to the project. You will discuss the options and a suitable issue will be assigned or created to you.

Monolint was implemented in an extensible way for creating more and more rules as needed, so if you new a new feature, contribute to our project! Read [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

If you work or know a good public monorepo, please let us now so we can use it as a reference test for this tool!

[Check rules documentation here](rules.md)

## Usage

- Simplest run

  - Checkout an example monorepo at https://github.com/vsavkin/large-monorepo
  - Execute `npx monolint .` inside the repo dir
  - The checks will use default parameters
  - Check the validation results

- Customize rules
  - Create ".monolint.json" at the root of your monorepo with contents

```json
{
  "module-markers": ["package.json"],
  "rules": {
    "packagejson-same-name": false
  }
}
```

- Execute `npx monolint .`
  - In this example, it will search for any folder that has a file "package.json" and consider it a module
  - Then it will run all default enabled rules, but will turn off rule "packagejson-same-name", which enforces the "name" property of the package.json contents to have the same name as the module folder
- See results

## Concepts

- The name of the discovered modules is the same as its folder. So, a module at "group1/module-black" will have the name "module-black". The module name is used by various rules and on the results report to help you locate where the error is.

### **.monolint.json**

- Create this file for configuring monolint
- This file normally is at the root of our monorepo, but you can place it in intermediary folders or in the module itself to setup specific configurations for the different parts of the monorepo

- The structure of this file is

```json
{
  "module-markers": ["package.json", "serverless.yml"],
  "use-gitignore": true,
  "rules": {
    "serverless-same-name": true,
    "packagejson-same-name": true
  },
  "defaults": true
}
```

- 'module-markers' - declare a list of file names that, if found in any folder inside the monorepo, will make the folder considered a module. Used only in the base folder of the monorepo.
- 'use-gitignore' - whatever use .gitignore (is exists) as the starting point for defining the patterns (along with .monolintignore) for ignore paths during module search. Defaults to true
- 'rules' - activate/deactivate rules, or setup specific configurations for a rule
- 'defaults' - whatever use default configurations or not. Defaults to true.

- This file can be placed in any folder to define specific configurations/rules for different branches of the monorepo.
  - Example:
    /.monolint.json - enables rule "serverless-same-name"
    /modules/group1
    /.monolint.json - disables rule "serverless-same-name"
    /module-test1 -> won't be checked by "serverless-same-name"
    /module-test2 -> won't be checked by "serverless-same-name"
    /module-test3 -> will be checked by "serverless-same-name"

### **.monolintignore**

- Create file ".monolintignore" at the root folder of the monorepo with file/directory patterns to be ignored during module discovery. You can use these patterns to hide entire branches of the monorepo from monolint or just specific directories.

- The ignore patterns works as follows:

  - Add each ignore pattern in a new line of the file
  - '\*' - matches a single level of dir
  - '\*\*' - matches any number of levels of a dir
  - When a parent dir matches the ignore pattern, all its childs will be ignored

- Example

  - Repo structure

```
modules/
  ⌞ auth-svc/
  ⌞ todo-web/
shared/
  ⌞ utils/
lib/test/external/
  ⌞ legacy
  ⌞ platform
.monolintignore
```

- .monolintignore

```
**/legacy
modules/auth-svc
shared
```

- The following structure will be visible to monolint

```
modules/
  ⌞ todo-web/
lib/test/external/
  ⌞ platform
```

### Rules

Each check that you want to do in the monorepo is done by a "rule". You can enable/disable/configure then in .monolint.json configuration file.

[Check rules documentation here](rules.md)

## Awesome list of other Poppins projects for you to go

[![Awesome](https://camo.githubusercontent.com/1997c7e760b163a61aba3a2c98f21be8c524be29/68747470733a2f2f617765736f6d652e72652f62616467652e737667)](https://github.com/sindresorhus/awesome)

- [First Contributions Repository](https://github.com/firstcontributions/first-contributions): Help beginners to contribute to open source projects
- [Contribute to this Project](https://github.com/Syknapse/Contribute-To-This-Project): This is for absolute beginners. If you know how to write and edit an anchor tag <a href="" target=""></a> then you should be able to do it.
- [Contribute to open source](https://github.com/danthareja/contribute-to-open-source):
  Learn the GitHub workflow by contributing code in a fun simulation project
