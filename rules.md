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
