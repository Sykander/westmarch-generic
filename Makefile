CATALOGUE_GENERATORS = generate-monsters generate-items generate-spells generate-books generate-recipes
GENERATE_TARGETS = generate-env generate-vars $(CATALOGUE_GENERATORS)

.PHONY: build test install_node install_avrae_ls build_dev build_prod sourcemap-tests lint unit-tests $(GENERATE_TARGETS)

#
# Useful
#
build: $(CATALOGUE_GENERATORS) build_dev build_prod

test: lint sourcemap-tests unit-tests

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

install_avrae_ls:
	uv tool install avrae-ls
	uv tool update avrae-ls

#
# Steps
#
build_dev: install_node generate-vars
	npm run generate-env:dev

build_prod: install_node
	npm run generate-env:prod

sourcemap-tests: install_node
	npm run test-sourcemaps

lint: install_node
	npm run lint

unit-tests: install_avrae_ls
	npm test
