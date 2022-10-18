build: 
	npm ci

run:
	npx ts-node src/main.ts --base-dir=./src/rules/test-monorepo

lint:
	npx eslint . --ext .ts
	npx tsc -noEmit --skipLibCheck
	npm audit --audit-level high

unit-tests:
	npm run test

publish:
	npm version patch
	git config --global user.email "flaviostutz@gmail.com"
	git config --global user.name "Flávio Stutz"
	npm publish

all: lint build run test
