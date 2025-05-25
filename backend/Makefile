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

test:
	go test ./...

coverage:
	go test ./... -coverpkg=./... -cover -coverprofile=coverage.out

view-coverage: coverage
	go tool cover -html=coverage.out

save-coverage: coverage
	go tool cover -html=coverage.out -o coverage.html

check-coverage: coverage
	go tool cover -func=coverage.out | grep total | grep -q '100.0%' || exit 1

lint:
	golangci-lint run

clean:
	go clean -testcache

# Build for deploying. We can't build a static binary because sqlite needs a dynamic one. And we need musl-gcc because we use alpine for the docker image
prod:
    CGO_ENABLED=1 CC=musl-gcc GOOS=linux GOARCH=amd64 go build -ldflags '-extldflags "-static" -s -w -linkmode external' -o backend cmd/backend/main.go

docker: static
	docker build -t "backend-$(target)" --build-arg USE_EMULATOR="$$USE_EMULATOR" --build-arg PROJECT_ID="$$PROJECT_ID" --build-arg ALLOW_ORIGIN="$$ALLOW_ORIGIN" .
	docker save "backend-$(target)" > "backend-$(target).tar"

deploy: docker
	ssh -p "$(port)" "$(user)@$(server)" "docker stop \$$(docker ps -q --filter publish=$(listen-port)) ; docker load && docker container prune -f && docker image prune -f && docker run -d -p $(listen-port):8081 backend-$(target) /backend $(args)" < "backend-$(target).tar"

.PHONY: build deps tidy run test coverage view-coverage save-coverage check-coverage lint clean static deploy
