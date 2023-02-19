build: install
	yarn esbuild src/main.ts --bundle --platform=node --minify --outfile=dist/main.js

lint:
	yarn eslint . --ext .ts
	yarn tsc -noEmit --skipLibCheck
	yarn audit; [[ $? -ge 16 ]] && exit 1 || exit 0
	yarn ts-node src/rules-doc.ts --check

lint-fix: rules-doc
	yarn eslint . --ext .ts --fix

test: unit-tests


## DEV targets

run-dev:
	# yarn ts-node src/main.ts --base-dir=./src/rules/test-cases/general --verbose --filter="group1"
	# yarn ts-node src/main.ts --base-dir=./src/rules/test-cases/module-required-files --verbose
	# yarn ts-node src/main.ts --base-dir=../large-monorepo --verbose
	# ./dist/main.js
	# cd ../aws-serverless-spikes-monorepo && ../monolint/dist/main.js --verbose
	dist/main.js --verbose --base-dir=../aws-serverless-spikes-monorepo

clean:
	rm -rf node_modules
	rm -rf coverage
	rm -rf dist

unit-tests:
	yarn jest --verbose $(ARGS)

publish:
	git config --global user.email "flaviostutz@gmail.com"
	git config --global user.name "Flávio Stutz"
	npm version from-git --no-git-tag-version
	echo "//registry.npmjs.org/:_authToken=${NPM_ACCESS_TOKEN}" > .npmrc
	yarn publish

all: build lint unit-tests

rules-doc:
	yarn ts-node src/rules-doc.ts

upgrade-deps:
	yarn npm-check-updates -u

install:
	yarn install --frozen-lockfile
