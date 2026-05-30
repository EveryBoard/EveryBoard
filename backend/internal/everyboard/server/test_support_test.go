package server

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"github.com/stretchr/testify/require"
	"net"
	"net/http"
	"os"
	"strings"
	"testing"
	"time"
)

var testServerAddr string

func testHTTPURL(path string) string {
	return "http://" + testServerAddr + path
}

func testWebSocketURL(path string) string {
	return "ws://" + testServerAddr + path
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

func PrepareServer(t *testing.T) (func(), *FakeStore, *Configuration) {
	os.Clearenv()
	t.Setenv("USE_EMULATOR", "yes")
	t.Setenv("PROJECT_ID", "my-project")
	t.Setenv("DATABASE_TYPE", "sqlite")
	t.Setenv("DATABASE_DSN", "file::memory:")
	t.Setenv("ALLOW_ORIGIN", "*")
	t.Setenv("LISTEN_ADDR", "127.0.0.1:0")
	config, err := ReadConfiguration()
	require.NoError(t, err, "error when reading the configuration")

	fakeStore := NewFakeStore()
	config.Store = fakeStore
	config.Firebase = FirebaseMock{}

	server, err := Prepare(config)
	require.NoError(t, err, "error when preparing the server")

	listener, err := net.Listen("tcp", config.ListenAddr)
	require.NoError(t, err, "cannot listen on test server address")
	config.ListenAddr = listener.Addr().String()
	server.Addr = config.ListenAddr
	testServerAddr = config.ListenAddr

	serverErr := make(chan error, 1)
	go func() {
		err := server.Serve(listener)
		if err != nil && err != http.ErrServerClosed {
			serverErr <- err
		}
		close(serverErr)
	}()
	select {
	case err := <-serverErr:
		require.NoError(t, err, "test server exited while starting")
	default:
	}

	stopServer := func() {
		ctx, cancel := context.WithTimeout(context.Background(), time.Second)
		defer cancel()
		require.NoError(t, server.Shutdown(ctx), "Shutdown failed")
		require.NoError(t, <-serverErr, "ListenAndServe error")
	}
	return stopServer, fakeStore, config
}
