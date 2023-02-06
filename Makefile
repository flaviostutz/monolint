build: install
	npx esbuild src/main.ts --bundle --platform=node --minify --outfile=dist/main.js

lint:
	npx eslint . --ext .ts
	npx tsc -noEmit --skipLibCheck
	yarn audit; [[ $? -ge 16 ]] && exit 1 || exit 0
	npx ts-node src/rules-doc.ts --check

lint-fix: rules-doc
	npx eslint . --ext .ts --fix

test: unit-tests


## DEV targets

run-dev:
	npx ts-node src/main.ts --base-dir=./src/rules/test-cases/general --verbose --filter="group1"
	# npx ts-node src/main.ts --base-dir=./src/rules/test-cases/module-required-files --verbose
	# npx ts-node src/main.ts --base-dir=../large-monorepo --verbose

clean:
	rm -rf node_modules
	rm -rf coverage
	rm -rf dist

unit-tests:
	npx jest --verbose

publish:
	git config --global user.email "flaviostutz@gmail.com"
	git config --global user.name "Flávio Stutz"
	npm version from-git --no-git-tag-version
	echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
	yarn publish

all: build lint unit-tests

rules-doc:
	npx ts-node src/rules-doc.ts

upgrade-deps:
	npx npm-check-updates -u

install:
	yarn install --frozen-lockfile
