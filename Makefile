.PHONY: dist
dist: 
	npm run build

run: dist
	node dist/bundle.js

lint:
	npx eslint . --ext .ts
	npx tsc -noEmit --skipLibCheck
	npm audit --audit-level high
	
