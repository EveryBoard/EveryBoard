package internal

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/gorilla/websocket"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"

	everyboard "github.com/EveryBoard/EveryBoard/internal"
)

func setenv(t *testing.T, variable string, value string) {
	err := os.Setenv(variable, value)
	if err != nil {
		t.Fatalf("cannot set environment variable: %v", err)
	}
}

func TestReadConfigurationSqliteWithoutDsn(t *testing.T) {
	// Given a configuration with sqlite but no DSN
	os.Clearenv()
	setenv(t, "USE_EMULATOR", "yes")
	setenv(t, "PROJECT_ID", "my-project")
	setenv(t, "DATABASE_TYPE", "sqlite")
	setenv(t, "ALLOW_ORIGIN", "*")
	// When reading the configuration
	config, err := everyboard.ReadConfiguration()
	if err != nil {
		t.Fatalf("error when reading the configuration: %v", err)
	}
	// Then it should be a sqlite connection to everyboard.db
	sqliteDialector, ok := config.Database.(*sqlite.Dialector)
	if !ok {
		t.Fatalf("not a sqlite database")
	}
	if sqliteDialector.DSN != "everyboard.db" {
		t.Fatalf("database name should be everyboard.db but is %s", sqliteDialector.DSN)
	}
}

func TestReadConfigurationSqliteWithDsn(t *testing.T) {
	// Given a configuration with sqlite but no DSN
	os.Clearenv()
	setenv(t, "USE_EMULATOR", "yes")
	setenv(t, "PROJECT_ID", "my-project")
	setenv(t, "DATABASE_TYPE", "sqlite")
	databaseName := "foo.db"
	setenv(t, "DATABASE_DSN", databaseName)
	setenv(t, "ALLOW_ORIGIN", "*")
	// When reading the configuration
	config, err := everyboard.ReadConfiguration()
	if err != nil {
		t.Fatalf("error when reading the configuration: %v", err)
	}
	// Then it should be a sqlite connection to everyboard.db
	sqliteDialector, ok := config.Database.(*sqlite.Dialector)
	if !ok {
		t.Fatalf("not a sqlite database")
	}
	if sqliteDialector.DSN != databaseName {
		t.Fatalf("database name should be %s but is %s", databaseName, sqliteDialector.DSN)
	}
}

func TestReadConfiguarationPostgresWithoutDsn(t *testing.T) {
	// Given a configuration with postgres but no DSN
	os.Clearenv()
	setenv(t, "USE_EMULATOR", "yes")
	setenv(t, "PROJECT_ID", "my-project")
	setenv(t, "DATABASE_TYPE", "postgres")
	setenv(t, "ALLOW_ORIGIN", "*")

	// When reading the configuration
	_, err := everyboard.ReadConfiguration()
	// Then it should fail
	if err == nil {
		t.Fatalf("configuration with postgres and no dsn should be invalid")
	}
}

func TestReadConfigurationPostgresWithDsn(t *testing.T) {
	// Given a configuration with postgres but no DSN
	os.Clearenv()
	setenv(t, "USE_EMULATOR", "yes")
	setenv(t, "PROJECT_ID", "my-project")
	setenv(t, "DATABASE_TYPE", "postgres")
	dsn := "postgresql://postgres:secret@localhost:5432/testdb?sslmode=disable"
	setenv(t, "DATABASE_DSN", dsn)
	setenv(t, "ALLOW_ORIGIN", "*")

	// When reading the configuration
	config, err := everyboard.ReadConfiguration()
	if err != nil {
		t.Fatalf("error when reading the configuration: %v", err)
	}
	// Then it should be a sqlite connection to everyboard.db
	postgresDialector, ok := config.Database.(*postgres.Dialector)
	if !ok {
		t.Fatalf("not a postgres database")
	}
	if postgresDialector.DSN != dsn {
		t.Fatalf("database name should be %s but is %s", dsn, postgresDialector.DSN)
	}
}

func TestReadConfigurationWithoutOrigin(t *testing.T) {
	// Given a configuration without AllowOrigin
	os.Clearenv()
	setenv(t, "USE_EMULATOR", "yes")
	setenv(t, "PROJECT_ID", "my-project")
	setenv(t, "DATABASE_TYPE", "sqlite")
	// When reading the configuration
	_, err := everyboard.ReadConfiguration()
	// Then it should fail
	if err == nil {
		t.Fatalf("configuration without AllowOrigin should be incorrect but is not")
	}
}

func TestReadConfigurationWithOrigin(t *testing.T) {
	// Given a configuration with AllowOrigin
	os.Clearenv()
	setenv(t, "USE_EMULATOR", "yes")
	setenv(t, "PROJECT_ID", "my-project")
	setenv(t, "DATABASE_TYPE", "sqlite")
	setenv(t, "ALLOW_ORIGIN", "everyboard.org")
	// When reading the configuration
	config, err := everyboard.ReadConfiguration()
	if err != nil {
		t.Fatalf("error when reading the configuration: %v", err)
	}
	// The Origin should be set as expected
	if config.Origin != "everyboard.org" {
		t.Fatalf("origin improperly set")
	}
}

func TestReadConfigurationWithoutListenAddr(t *testing.T) {
	// Given a configuration without ListenAddr
	os.Clearenv()
	setenv(t, "USE_EMULATOR", "yes")
	setenv(t, "PROJECT_ID", "my-project")
	setenv(t, "DATABASE_TYPE", "sqlite")
	setenv(t, "ALLOW_ORIGIN", "*")
	// When reading the configuration
	config, err := everyboard.ReadConfiguration()
	if err != nil {
		t.Fatalf("error when reading the configuration: %v", err)
	}
	// Then it should default to :8081
	if config.ListenAddr != ":8081" {
		t.Fatalf("listen address improperly set")
	}
}

func TestReadConfigurationWithListenAddr(t *testing.T) {
	// Given a configuration with ListenAddr
	os.Clearenv()
	setenv(t, "USE_EMULATOR", "yes")
	setenv(t, "PROJECT_ID", "my-project")
	setenv(t, "DATABASE_TYPE", "sqlite")
	setenv(t, "ALLOW_ORIGIN", "*")
	setenv(t, "LISTEN_ADDR", "localhost:1234")
	// When reading the configuration
	config, err := everyboard.ReadConfiguration()
	if err != nil {
		t.Fatalf("error when reading the configuration: %v", err)
	}
	// Then it should use the provided value
	if config.ListenAddr != "localhost:1234" {
		t.Fatalf("listen address improperly set")
	}
}

type FirebaseMock struct {
}

func (f FirebaseMock) Initialize() error {
	return nil
}

func (f FirebaseMock) Fetch(context context.Context, collection string, path string) (map[string]interface{}, error) {
	return map[string]interface{}{
		"username": path, // path is the uid, and we use it as the username too here
	}, nil
}

func (f FirebaseMock) VerifyToken(context context.Context, token string) (string, error) {
	// Extract the identity from token as is without checking anything except well-formedness
	tokenParts := strings.Split(token, ".")
	if len(tokenParts) != 3 {
		return "", fmt.Errorf("invalid token format") // token must be 3 parts (header, payload, signature) separated by dots
	}

	// We only care here about the second part, which contains the payload
	payloadBytes, err := base64.RawURLEncoding.DecodeString(tokenParts[1])
	if err != nil {
		return "", fmt.Errorf("invalid payload encoding") // payload is not a b64 string
	}

	var claims map[string]interface{}
	err = json.Unmarshal(payloadBytes, &claims)
	if err != nil {
		return "", fmt.Errorf("invalid payload") // payload cannot be decoded as a map
	}

	sub, ok := claims["sub"].(string)
	if !ok {
		return "", fmt.Errorf("missing 'sub' part of token")
	}

	return sub, nil
}

func PrepareServer(t *testing.T) (func(), *FakeStore, *everyboard.Configuration) {
	os.Clearenv()
	setenv(t, "USE_EMULATOR", "yes")
	setenv(t, "PROJECT_ID", "my-project")
	setenv(t, "DATABASE_TYPE", "sqlite")
	setenv(t, "DATABASE_DSN", "file::memory:")
	setenv(t, "ALLOW_ORIGIN", "*")
	config, err := everyboard.ReadConfiguration()
	if err != nil {
		t.Fatalf("error when reading the configuration: %v", err)
	}

	fakeStore := NewFakeStore()
	config.Store = fakeStore
	config.Firebase = FirebaseMock{}

	server, err := everyboard.Prepare(config)
	if err != nil {
		t.Fatalf("error when preparing the server: %v", err)
	}

	serverErr := make(chan error, 1)
	go func() {
		err := server.ListenAndServe()
		if err != nil && err != http.ErrServerClosed {
			serverErr <- err
		}
		close(serverErr)
	}()
	time.Sleep(1000 * time.Millisecond) // let the server start
	select {
	case err := <-serverErr:
		if err != nil {
			t.Fatalf("ListenAndServe error: %v", err)
		}
	default:
	}

	stopServer := func() {
		ctx, cancel := context.WithTimeout(context.Background(), time.Second)
		defer cancel()
		if err := server.Shutdown(ctx); err != nil {
			t.Fatalf("Shutdown failed: %v", err)
		}
		if err := <-serverErr; err != nil {
			t.Fatalf("ListenAndServe error: %v", err)
		}
	}
	return stopServer, fakeStore, config
}

func TestCors(t *testing.T) {
	// Given a server
	stopServer, _, _ := PrepareServer(t)
	defer stopServer()

	// When doing a Options request
	req, err := http.NewRequest(http.MethodOptions, "http://localhost:8081/ws", nil)
	if err != nil {
		t.Fatalf("request creation failed: %v", err)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("OPTIONS request failed: %v", err)
	}
	defer resp.Body.Close()

	// Then it should succeed and have the Allow-Origin header set
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		t.Errorf("Unexpected status: %d", resp.StatusCode)
	}

	if origin := resp.Header.Get("Access-Control-Allow-Origin"); origin != "*" {
		t.Errorf("Expected Access-Control-Allow-Origin '*', got %q", origin)
	}
}

func TestWebSocketRequest(t *testing.T) {
	// Given a server
	stopServer, _, _ := PrepareServer(t)
	defer stopServer()

	// When doing a websocket request
	headers := http.Header{}
	headers.Set("Sec-WebSocket-Protocol", "Authorization, yJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJmb28ifQo.")
	c, resp, err := websocket.DefaultDialer.Dial("ws://localhost:8081/ws", headers)
	if err != nil {
		t.Fatalf("Dial failed: %v (status %v)", err, resp.Status)
	}
	defer c.Close()

	// Then it should upgrade to websocket
	if resp.StatusCode != http.StatusSwitchingProtocols {
		t.Errorf("Expected 101 Switching Protocols, got %d", resp.StatusCode)
	}

	// And send a first message about current game
	_, _, err = c.ReadMessage()
	if err != nil {
		t.Fatalf("cannot send message: %v", err)
	}

	// When we send a broken message
	err = c.WriteMessage(websocket.TextMessage, []byte(`alq"`))
	if err != nil {
		t.Fatalf("cannot send message: %v", err)
	}
	// Then we get an error reply
	_, msg, err := c.ReadMessage()
	if err != nil {
		t.Fatalf("error when receiving response: %v", err)
	}
	if string(msg) != `["Error",{"reason":"unknown-message"}]` {
		t.Fatalf("error response is not the expected one: %s", string(msg))
	}

	// When we send a not-understood message
	err = c.WriteMessage(websocket.TextMessage, []byte(`["Unknown"]`))
	if err != nil {
		t.Fatalf("cannot send message: %v", err)
	}
	// Then we get an error reply
	_, msg, err = c.ReadMessage()
	if err != nil {
		t.Fatalf("error when receiving response: %v", err)
	}
	if string(msg) != `["Error",{"reason":"unknown-message"}]` {
		t.Fatalf("error response is not the expected one: %s", string(msg))
	}

	// When we send an understood message
	err = c.WriteMessage(websocket.TextMessage, []byte(`["SubscribeToLobby"]`))
	if err != nil {
		t.Fatalf("cannot send message: %v", err)
	}
	// Then it works
	_, msg, err = c.ReadMessage()
	if err != nil {
		t.Fatalf("error when receiving response: %v", err)
	}
	if string(msg) != `["Error",{"reason":"unknown-message"}]` {
		t.Fatalf("error response is not the expected one: %s", string(msg))
	}
}
