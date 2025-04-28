.PHONY: build

build:
	go build -o backend cmd/backend/main.go

# Run locally
run: build
	grep "new GameInfo" ../src/app/components/normal-component/pick-game/pick-game.component.ts | sed -E "s/.*new GameInfo\([^,]+, +'([^']+)'.*/\1/" > games.txt
	env USE_EMULATOR=yes PROJECT_ID=my-project go run cmd/backend/main.go

test:
	go test ./...

coverage:
	go test ./... -coverpkg=./... -cover -coverprofile=coverage.out

view-coverage:
	go tool cover -html=coverage.out

lint:
	golangci-lint run

clean:
	go clean -testcache
