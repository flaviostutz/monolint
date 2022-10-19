# Rules

See below all rules that can be used for monorepo linting.

Those configurations should be added to a file in the root of the monorepo called '.monolint.json'. If you create this file in intermediate folder (or even in the module folder), it will be merged to the root and default configurations also.

## __module-name-regex__

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

## __packagejson-same-name__

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

## __serverless-same-name__

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
