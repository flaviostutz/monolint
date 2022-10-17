# Monolinter

Linter for monorepos. Checks folder structure, module contents, file contents and naming conventions of a monorepo.

This tool will look for modules inside the repo (which are folders with a certain "marker file", like package.json). After discovering the module folders, it will run a set a rules to check if the modules are well structured and show the results.

Some example of the rules are: check if all modules are inside a certain folder, check if module names comply to a specific naming convention, check if certain file between modules have the same contents, check if github actions workflow name contains the name of the corresponding module...

Monolinter was implemented in an extensible way for creating more and more rules as needed, so if you new a new feature, contribute to our project! Read [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## Usage

* Simplest run
  * Execute `npx monolinter .` at the root of your monorepo
  * The checks will use default parameters
  * Check the validation results

* Customize rules
  * Create ".monolinter.json" at the root of your monorepo with contents

```json
{
    "module-markers": ["package.json"],
    "rules": {
        "packagejson-same-name": false,
    }
}
```

  * Execute `npx monolinter .`
    * In this example, it will search for any folder that has a file "package.json" and consider it a module
    * Then it will run all default enabled rules, but will turn off rule "packagejson-same-name", which enforces the "name" property of the package.json contents to have the same name as the module folder
  * See results

## Concepts

* The name of the discovered modules is the same as its folder. So, a module at "group1/module-black" will have the name "module-black". The module name is used by various rules and on the results report to help you locate where the error is.

### __.monolinter.json__

* Create this file for configuring monolinter
* This file normally is at the root of our monorepo, but you can place it in intermediary folders or in the module itself to setup specific configurations for the different parts of the monorepo

* The structure of this file is

```json
{
  "module-markers": ["package.json", "serverless.yml"],
  "rules": {
    "serverless-same-name": true,
    "packagejson-same-name": true,
  },
}
```

  * 'module-markers' - declare a list of file names that, if found in any folder inside the monorepo, will make the folder considered a module. Used only in the base folder of the monorepo.
  * 'rules' - activate/deactivate rules, or setup specific configurations for a rule

* This file can be placed in any folder to define specific configurations/rules for different branches of the monorepo.
  * Example:
        /.monolinter.json - enables rule "serverless-same-name"
        /modules/group1
                       /.monolinter.json - disables rule "serverless-same-name"
                       /module-test1 -> won't be checked by "serverless-same-name"
                       /module-test2 -> won't be checked by "serverless-same-name"
                /module-test3 -> will be checked by "serverless-same-name"


### __.monolinterignore__

* Place an empty file with name ".monolinterignore" in any folder of a module, or an intermediary grouping folder so monolinter won't discover nor check anything in these paths

### Rules

These are the rules you can enable/disable in .monolinter.json configuration file.

#### __packagejson-same-name__

* Checks if the attribute "name" of package.json is the same as the name of the module.

#### __serverless-same-name__

* Checks if the attribute "service" of serverless.yml is the same as the name of the module.

