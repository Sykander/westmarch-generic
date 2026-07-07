CATALOGUE_GENERATORS = generate-monsters generate-items generate-spells generate-books generate-recipes
GENERATE_TARGETS = $(CATALOGUE_GENERATORS) generate-vars generate-env generate-env-prod

.PHONY: build test deploy editor editor-build types editor-test nx-test nx-affected-test nx-graph install_node install_editor install_avrae_ls sourcemap-test lint unit-tests $(GENERATE_TARGETS)

#
# Useful
#
build: install_node install_editor
	npm run build
	npm run lint:fix

test: lint nx-test

deploy: build
	npx nx run avrae-sourcemaps:deploy-dev

editor: install_editor
	npm run editor

editor-build: install_editor
	npx nx run editor:build

types: install_node install_editor
	npm run types

editor-test: install_node install_editor
	npx nx run editor:test

nx-test: install_node install_editor install_avrae_ls
	npm test

nx-affected-test: install_node install_editor install_avrae_ls
	npx nx affected -t test --parallel 4

nx-graph: install_node
	npx nx graph

#
# Generates
#
generate-env: install_node
	npx nx run avrae-sourcemaps:generate-env

generate-env-prod: install_node
	npx nx run avrae-sourcemaps:generate-env-prod

generate-vars: install_node
	npx nx run avrae-sourcemaps:generate-vars

generate-monsters: install_node
	npx nx run avrae-sourcemaps:generate-monsters

generate-items: install_node
	npx nx run avrae-sourcemaps:generate-items

generate-spells: install_node
	npx nx run avrae-sourcemaps:generate-spells

generate-books: install_node
	npx nx run avrae-sourcemaps:generate-books

generate-recipes: install_node
	npx nx run avrae-sourcemaps:generate-recipes

#
# Installs
#
install_node:
	npm ci

install_editor:
	npm --prefix editor ci

install_avrae_ls:
	uv tool install avrae-ls
	uv tool update avrae-ls

sourcemap-test: install_node
	npx nx run avrae-sourcemaps:test

lint: install_node
	npm run lint

unit-tests: nx-test
