.PHONY: build

build:
	go build -o backend cmd/backend/main.go

run: build
	# Run locally
	env USE_EMULATOR=yes PROJECT_ID=my-project go run cmd/backend/main.go

test:
	go test ./...

lint:
	golangci-lint run
