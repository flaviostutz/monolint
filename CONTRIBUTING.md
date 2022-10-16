# CONTRIBUTING

Thank you for being interested in helping with Monolinter!

## The best way to start

* Look at the "Issues" and choose something to implement
* Make a fork of this project to your account
* Implement it and create unit tests
* Create a PR after you complete it to master branch

## Questions and discussions

* Discuss design or implementation details of a specific feature in the related Issue comments
* If you have more generic question, create a new Issue

## Bugs and feature requests

* If you find any bug, create a new Issue describing what is the structure of your monorepo and what kind of error you had. If possible, send a link of your repo, or a screenshot of its structure.

* If you want a new feature, open an Issue and explain your real use case, the kind of problems you have nowadays and how you think Monolinter could help you in practice.

## Prepare your development environment

* Install npm and "make" on your machine
* Git clone this repo
* Type `make run-dev` to see a first run
* Use preferrebly VSCode with ESLint plugin installed so linting with auto fix will be available

## Pipeline and Publishing to NPM

* Everytime a PR or a commit is made to "master" branch linting and building will be run. Your PR will only be analysed with a successfull GH pipeline run
* When a new tag is created a GH pipeline will publish a release to NPM registry

