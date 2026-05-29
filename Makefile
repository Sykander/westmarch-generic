#
# Useful
#
rebuild: rebuild_dev rebuild_prod

test: sourcemap-tests unit-tests

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
rebuild_dev: install_node
	ENVIRONMENT=Development npm run generate-env
	npm run generate-vars

rebuild_prod: install_node
	ENVIRONMENT=Production npm run generate-env

sourcemap-tests: install_node
	npm run test-sourcemaps

unit-tests: install_avrae_ls
	avrae-ls --run-tests src --log-level INFO
