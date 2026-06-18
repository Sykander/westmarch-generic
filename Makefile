CATALOGUE_GENERATORS = generate-monsters generate-items generate-spells generate-books generate-recipes
GENERATE_TARGETS = $(CATALOGUE_GENERATORS) generate-vars generate-env
AVRAE_UTILS_TEST_TARGETS = avrae-test-utils-config avrae-test-utils-catalogues avrae-test-utils-gameplay avrae-test-utils-systems
AVRAE_ALIAS_TEST_TARGETS = avrae-test-aliases-content avrae-test-aliases-crafting avrae-test-aliases-economy avrae-test-aliases-exploration avrae-test-aliases-travel avrae-test-aliases-westmarch
AVRAE_SHARD_TEST_TARGETS = $(AVRAE_UTILS_TEST_TARGETS) $(AVRAE_ALIAS_TEST_TARGETS)
AVRAE_TEST_TARGETS = avrae-test-config avrae-test-gvars avrae-test-utils $(AVRAE_UTILS_TEST_TARGETS) $(AVRAE_ALIAS_TEST_TARGETS)

.PHONY: build test deploy editor editor-build types editor-test install_node install_editor install_avrae_ls sourcemap-test lint unit-tests $(AVRAE_TEST_TARGETS) $(GENERATE_TARGETS)

#
# Useful
#
build: $(GENERATE_TARGETS) editor-build
	npm run lint:fix

test: lint sourcemap-test types editor-test $(AVRAE_SHARD_TEST_TARGETS)

deploy: build
	npm run deploy:dev

editor: install_editor
	npm run editor

editor-build: install_editor
	npm run editor:build

types: install_editor
	npm run types

editor-test: install_editor
	npm run editor:test

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

sourcemap-test: install_node
	npm run sourcemap:dev-check
	npm run sourcemap:prod-check
	npm run sourcemap:compare-check

lint: install_node
	npm run lint

avrae-test-config: install_avrae_ls
	npm run avrae:test-config

avrae-test-gvars: install_avrae_ls
	npm run avrae:test-gvars

avrae-test-utils: install_avrae_ls
	npm run avrae:test-utils

avrae-test-aliases-content: install_avrae_ls
	npm run avrae:test-aliases:content

avrae-test-aliases-crafting: install_avrae_ls
	npm run avrae:test-aliases:crafting

avrae-test-aliases-economy: install_avrae_ls
	npm run avrae:test-aliases:economy

avrae-test-aliases-exploration: install_avrae_ls
	npm run avrae:test-aliases:exploration

avrae-test-aliases-travel: install_avrae_ls
	npm run avrae:test-aliases:travel

avrae-test-aliases-westmarch: install_avrae_ls
	npm run avrae:test-aliases:westmarch

avrae-test-utils-config: install_avrae_ls
	npm run avrae:test-utils:config

avrae-test-utils-catalogues: install_avrae_ls
	npm run avrae:test-utils:catalogues

avrae-test-utils-gameplay: install_avrae_ls
	npm run avrae:test-utils:gameplay

avrae-test-utils-systems: install_avrae_ls
	npm run avrae:test-utils:systems

unit-tests: $(AVRAE_SHARD_TEST_TARGETS)
