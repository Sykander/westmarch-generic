CATALOGUE_GENERATORS = generate-monsters generate-items generate-spells generate-books generate-recipes
GENERATE_TARGETS = $(CATALOGUE_GENERATORS) generate-vars generate-env

.PHONY: build test deploy editor editor-build install_node install_editor install_avrae_ls sourcemap-tests lint unit-tests $(GENERATE_TARGETS)

#
# Useful
#
build: $(GENERATE_TARGETS) editor-build

test: lint sourcemap-tests unit-tests

deploy: build
	npm run deploy:dev

editor: install_editor
	npm run editor:serve

editor-build: install_editor
	npm run editor:build

#
# Generates
#
generate-env: install_node
	npm run generate-env

generate-vars: install_node
	npm run generate-vars

generate-monsters: install_node
	npm run generate:monsters

generate-items: install_node
	npm run generate:items

generate-spells: install_node
	npm run generate:spells

generate-books: install_node
	npm run generate:books

generate-recipes: install_node
	npm run generate:recipes

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

sourcemap-tests: install_node
	npm run test-sourcemaps

lint: install_node
	npm run lint

unit-tests: install_avrae_ls
	npm test
