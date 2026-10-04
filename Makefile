CI_COMPOSE := docker compose -f compose.ci.yml
CI_E2E_COMPOSE := docker compose -p everyboard-ci-e2e -f compose.ci.yml

ci: ci-build ci-frontend ci-backend ci-lint ci-translations ci-images ci-e2e

ci-build:
	$(CI_COMPOSE) run --build --rm --no-deps frontend-build

ci-frontend:
	mkdir -p coverage
	$(CI_COMPOSE) run --build --rm --no-deps frontend-tests

ci-backend:
	touch backend/coverage.html
	@trap '$(CI_COMPOSE) down --remove-orphans' EXIT; \
		$(CI_COMPOSE) run --build --rm backend-tests

ci-lint:
	$(CI_COMPOSE) run --build --rm --no-deps frontend-lint

ci-translations:
	$(CI_COMPOSE) run --build --rm --no-deps translations

ci-images:
	$(CI_COMPOSE) run --build --rm --no-deps images

ci-e2e:
	@trap '$(CI_E2E_COMPOSE) down --remove-orphans' EXIT; \
		$(CI_E2E_COMPOSE) run --build --rm e2e

ci-clean:
	$(CI_COMPOSE) down --remove-orphans --volumes

.PHONY: ci ci-build ci-frontend ci-backend ci-lint ci-translations ci-images ci-e2e ci-clean
