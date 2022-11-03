# Rules

See below all rules that can be used for monorepo linting.

Those configurations should be added to a file in the root of the monorepo called '.monolint.json'. If you create this file in intermediate folder (or even in the module folder), it will be merged to the root and default configurations also.

## **gh-workflow-module-prefix**

* Checks if workflow file name starts with a known module name. Additionally it can check for specific prefixes in the name, and, if required, if a set of suffixed file names exists for each module

* Examples:


  * Activates this rule. It will just check if workflow name prefix starts with an existing module name

```json
{
  "rules": {
    "gh-workflow-module-prefix": true
  }
}
```

  * Deactivates this rule

```json
{
  "rules": {
    "gh-workflow-module-prefix": false
  }
}
```

  * Checks if workflow file name starts with a known module name and ends with one of "-dev" or "-prd"

```json
{
  "rules": {
    "gh-workflow-module-prefix": {
      "suffixes": [
        "-dev",
        "-prd"
      ]
    }
  }
}
```

  * Checks, for each existing module, if there exists a workflow file which name ends with "-dev" and another with "-prd". If we have modules "mod1" and "mod2", files "mod1-dev.yml, mod1-prd.yml, mod2-dev.yml, mod2-prd.yml" are required

```json
{
  "rules": {
    "gh-workflow-module-prefix": {
      "required": true,
      "suffixes": [
        "-dev",
        "-prd"
      ]
    }
  }
}
```

## **module-name-regex**

* Check if "name" attribute of the package.json file equals (or ends with) the name of the module

* Examples:


  * Activates this rule with default regex "[a-z]+[a-z0-9-_]{4,12}"

```json
{
  "rules": {
    "module-name-regex": true
  }
}
```

  * Deactivates this rule

```json
{
  "rules": {
    "module-name-regex": false
  }
}
```

  * Module names should be sufixed by "-svc" or "web"

```json
{
  "rules": {
    "module-name-regex": ".+(-svc|-web)"
  }
}
```

## **module-parent-folder**

* Check whether all module folders has a parent folder, allowing the usage of `glob` path pattern

* Examples:


  * Deactivates this rule

```json
{
  "rules": {
    "module-parent-folder": false
  }
}
```

  * All modules should have the following possible parent folders: 'packages', 'apps', 'libs', 'services'

```json
{
  "rules": {
    "module-parent-folder": {
      "module-parent-folder": [
        "packages",
        "apps",
        "libs",
        "services"
      ]
    }
  }
}
```

  * All modules should be in a folder named 'package' that is a descendant of a folder named 'apps'

```json
{
  "rules": {
    "module-parent-folder": {
      "module-parent-folder": [
        "apps/**/packages"
      ]
    }
  }
}
```

  * All modules should have a parent folder named 'modules'

```json
{
  "rules": {
    "module-parent-folder": {
      "module-parent-folder": [
        "modules"
      ]
    }
  }
}
```

## **module-required-files**

* Check whether all the required files are present in the modules folders

* Example:


  * Deactivates this rule

```json
{
  "rules": {
    "module-required-files": false
  }
}
```

## **module-folder-structure**

* Check whether all the required folders are present in the modules folders

* Examples:

  * Deactivates this rule

  ```json
  {
    "rules": {
      "module-folder-structure": false
    }
  }

  ```
  * Activates this rule using default folders (defaults: `["src"]`)

  ```json
  {
    "rules": {
      "module-folder-structure": true
    }
  }

  ```

  * Loosely requires module structure. 
  > The module should contain **at least** this set of folders, but can still have others.

  ```json
  {
    "rules": {
      "module-folder-structure": {
        "strict": false,
        "folders": ["src", "docs", "libs"]
      }
    }
  }

  ```

  * Strictly requires module structure 
  > No extra folders allowed, should match exactly.

  ```json
  {
    "rules": {
      "module-folder-structure": {
        "strict": true,
        "folders": ["src/test", "src/**/utils", "src/libs/**/release"]
      }
    }
  }
  ```

## **module-same-contents**

* Checks if specified files have the same content among the different modules
* It doesn't complain or checks for files that aren't present on modules. If you need this, use rule 'module-required-files'
* Default behavior:
  * It will try to select the module with most files as the reference module and check the other modules's files against it  * Files checked: ["LICENSE","jest.config.js","tsconfig.json","tsconfig.eslint.json",".eslintrc.js","eslintignore",".prettierrc.js",".prettierignore"]  * Files must have the be exactly the same contents (min-similarity=100%)* With expanded configurations you can change which files are checked and the similarity threshold* Use jsonpointer selectors (https://www.rfc-editor.org/rfc/rfc6901) to define which parts of the file must be equal among files using attribute "selector". Supported file types are yml and json (yml files are transformed into json before being checked)

* Examples:


  * Deactivate this rule

```json
{
  "rules": {
    "module-same-contents": false
  }
}
```

  * Overwrites default checked files with a new set of files that must be 100% similar and forces reference module to be 'my-best-module'

```json
{
  "rules": {
    "module-same-contents": {
      "reference-module": "my-best-module",
      "files": [
        "special.txt",
        "src/index.js"
      ]
    }
  }
}
```

  * File 'README.md' must be at least 70% and 'src/config.js' must be 98% similar to the same files on reference module. 'tsconfig.json' won't be checked anymore. All other default files will continue to be checked

```json
{
  "rules": {
    "module-same-contents": {
      "files": {
        "README.md": {
          "min-similarity": 70
        },
        "src/config.js": {
          "min-similarity": 98
        },
        "tsconfig.json": {
          "enabled": false
        }
      }
    }
  }
}
```

  * Attributes 'provider.runtime' and 'provider/stackName' of serverless.yml and script 'test' of package.json must be equal among modules (it won't check the whole file). Jsonpointer (https://www.rfc-editor.org/rfc/rfc6901) notation was used to select the attributes

```json
{
  "rules": {
    "module-same-contents": {
      "files": {
        "serverless.yml": {
          "selectors": [
            "/provider/runtime",
            "/provider/stackName",
            "/plugins/0"
          ]
        },
        "package.json": {
          "selectors": [
            "/scripts/dist",
            "/repository/type"
          ]
        }
      }
    }
  }
}
```

## **module-unique-name**

* Checks if the name of the modules are unique in the entire monorepo, regardless of the which folder it is present

* Example:


  * Disable this rule

```json
{
  "rules": {
    "module-unique-name": false
  }
}
```

## **packagejson-same-name**

* Check if "name" attribute of the package.json file equals (or ends with) the name of the module

* Example:


  * Deactivates this rule

```json
{
  "rules": {
    "packagejson-same-name": false
  }
}
```

## **serverless-same-name**

* Check if "service" attribute of the serverless.yml file equals (or ends with) the name of the module

* Example:


  * Deactivates this rule

```json
{
  "rules": {
    "serverless-same-name": false
  }
}
```
