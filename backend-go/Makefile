.PHONY: build

build:
	go build -o backend cmd/backend/main.go

run: build
	go run cmd/backend/main.go

test:
	go test ./...

lint:
	golangci-lint run
