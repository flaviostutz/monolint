build: 
	npm run build

run:
	npx ts-node src/main.ts --base-dir=./src/rules/test-monorepo

lint:
	npx eslint . --ext .ts
	npx tsc -noEmit --skipLibCheck
	npm audit --audit-level high

test:
	npm run test
