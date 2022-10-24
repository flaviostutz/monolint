# Rules

See below all rules that can be used for monorepo linting.

Those configurations should be added to a file in the root of the monorepo called '.monolint.json'. If you create this file in intermediate folder (or even in the module folder), it will be merged to the root and default configurations also.

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

## **module-same-contents**

* Checks if specified files have the same content among the different modules
* It doesn't complain or checks for files that aren't present on modules. If you need this, use rule 'module-required-files'
* Default behavior:
  * It will try to select the module with most files as the reference module and check the other modules's files against it  * Files checked: ["LICENSE","jest.config.js","tsconfig.json","tsconfig.eslint.json",".eslintrc.js","eslintignore",".prettierrc.js",".prettierignore"]  * Files must have the be exactly the same contents (min-similarity=100%)* With advanced configurations you can change which files are checked and the similarity threshold

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
