CI_COMPOSE := docker compose -f compose.ci.yml

ci: ci-build ci-frontend ci-backend ci-lint ci-translations ci-images

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

ci-clean:
	$(CI_COMPOSE) down --remove-orphans --volumes

.PHONY: ci ci-build ci-frontend ci-backend ci-lint ci-translations ci-images ci-clean

