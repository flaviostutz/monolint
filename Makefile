build: 
	npm ci
	npm run build

run:
	# npx ts-node src/main.ts --base-dir=./src/rules/test-cases/general --verbose
	npx ts-node src/main.ts --base-dir=./src/rules/.tmp/psn/test-cases/general --verbose --fix
	# npx ts-node src/main.ts --base-dir=./src/rules/test-cases/module-required-files --verbose
	# npx ts-node src/main.ts --base-dir=../large-monorepo --verbose

lint:
	npx prettier --loglevel warn --check .
	npx eslint . --ext .ts
	npx tsc -noEmit --skipLibCheck
	npm audit --audit-level high
	npx ts-node src/rules-doc.ts --check

lint-fix: rules-doc
	npx prettier --loglevel warn --write .
	npx eslint . --ext .ts --fix

test: unit-tests

unit-tests:
	npm run test

publish:
	git config --global user.email "flaviostutz@gmail.com"
	git config --global user.name "Flávio Stutz"
	npm version from-git
	npm publish

all: build lint unit-tests

rules-doc:
	npx ts-node src/rules-doc.ts

upgrade-deps:
	npx npm-check-updates -u

