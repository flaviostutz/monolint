run-dev: 
	npx ts-node src/main.ts --base-dir=./monorepo-example

.PHONY: dist
dist: 
	npm run build

lint:
	npx eslint . --ext .ts
	npx tsc -noEmit --skipLibCheck
	npm audit --audit-level high
	
