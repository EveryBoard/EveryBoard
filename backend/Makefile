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
	env USE_EMULATOR=yes PROJECT_ID=my-project go run cmd/backend/main.go

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

# Static build for deploying
static:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o backend -a -ldflags '-s -w' cmd/backend/main.go

docker: static
	docker build -t "backend-$(target)" -f Dockerfile .
	docker save "backend-$(target)" > "backend-$(target).tar"

deploy: docker
	ssh -p "$(port)" "$(user)@$(server)" "docker stop \$$(docker ps -q --filter publish=$(listen-port)) ; docker load && docker container prune -f && docker image prune -f && docker run -d -p $(listen-port):8081 backend-$(target) /backend $(args)" < "backend-$(target).tar"

.PHONY: build deps tidy run test coverage view-coverage save-coverage check-coverage lint clean static deploy
