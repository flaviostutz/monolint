build: 
	npm ci
	npm run build

run:
	npx ts-node src/main.ts --base-dir=./src/rules/test-monorepo --verbose
	# npx ts-node src/main.ts --base-dir=../large-monorepo --verbose

lint:
	npx eslint . --ext .ts
	npx tsc -noEmit --skipLibCheck
	npm audit --audit-level high

unit-tests:
	npm run test

publish:
	git config --global user.email "flaviostutz@gmail.com"
	git config --global user.name "Flávio Stutz"
	npm version from-git
	npm publish

all: build lint unit-tests run

rules-doc:
	npx ts-node src/rules-doc.ts

