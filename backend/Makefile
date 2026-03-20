# Regular build for local run. Default target because it's the first one
build: deps
	go build -o backend cmd/backend/main.go

# Get the dependencies
deps:
	go mod download

# Get the dependencies and check the .mod file, possibly updating it
tidy:
	go mod tidy

# Run locally
run: build
	env USE_EMULATOR=yes PROJECT_ID=my-project ALLOW_ORIGIN='*' go run cmd/backend/main.go

version:
	@go run cmd/version/main.go

run-postgres: build
	env USE_EMULATOR=yes PROJECT_ID=my-project ALLOW_ORIGIN='*' \
		DATABASE_TYPE=postgres DATABASE_DSN="postgresql://$$DB_USERNAME:$$DB_PASSWORD@$$DB_HOST:5432/$$DB_NAME?sslmode=disable" \
		go run cmd/backend/main.go

format:
	go fmt ./...

test:
	go test ./...

coverage:
	go test ./... -coverpkg=./... -cover -coverprofile=coverage.out

view-coverage: coverage
	go tool cover -html=coverage.out -o coverage.html

# Check that coverage is above a certain threshold. Change the sed command to increase the threshold as needed
check-coverage: coverage
	go tool cover -func=coverage.out | grep total | grep -o '..\..%' | sed 's/%/>78/' | bc | grep -q 1

# Make sure that sources are formatted according to gofmt
check-fmt:
	test -z "$$(gofmt -l .)"

lint:
	golangci-lint run

clean:
	go clean -testcache

# Build for deploying. sqlite requires non-static build
prod:
	CGO_ENABLED=1 CC=musl-gcc GOOS=linux GOARCH=amd64 go build -ldflags '-extldflags "-static" -s -w -linkmode external' -o backend cmd/backend/main.go
#	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags '-s -w' -o backend cmd/backend/main.go

docker: prod
	docker build -t "backend-$(target)" \
		--build-arg USE_EMULATOR="$$USE_EMULATOR" \
		--build-arg PROJECT_ID="$$PROJECT_ID" \
		--build-arg ALLOW_ORIGIN="$$ALLOW_ORIGIN" \
		--build-arg DATABASE_HOST="$$DATABASE_HOST" \
		--build-arg DATABASE_USERNAME="$$DATABASE_USERNAME" \
		--build-arg DATABASE_PASSWORD="$$DATABASE_PASSWORD" \
		--build-arg DATABASE_NAME="$$DATABASE_NAME" \
		.
	docker save "backend-$(target)" > "backend-$(target).tar"

deploy: docker
	ssh -p "$(port)" "$(user)@$(server)" "docker stop \$$(docker ps -q --filter publish=$(listen-port)) ; docker load && docker container prune -f && docker image prune -f && docker run -d --network everyboard -p $(listen-port):8081 backend-$(target) /backend $(args)" < "backend-$(target).tar"

.PHONY: build deps tidy run test coverage view-coverage check-coverage lint clean prod deploy
