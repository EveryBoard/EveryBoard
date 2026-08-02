package ws

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/server"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/session"
	"github.com/gorilla/websocket"
	"github.com/stretchr/testify/require"
)

var testServerAddr string

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

type TestServer struct {
	Subscriptions *session.SubscriptionManager[*websocket.Conn]
	Connections   *session.ConnectionManager[*websocket.Conn]
}

func PrepareServer(t *testing.T) (func(), *FakeStore, *TestServer) {
	fakeStore := NewFakeStore()
	subscriptions := session.NewSubscriptionManager[*websocket.Conn]()
	connections := session.NewConnectionManager[*websocket.Conn]()
	testServer := &TestServer{
		Subscriptions: &subscriptions,
		Connections:   &connections,
	}

	websocketHandler := New(Dependencies{
		Firebase:      FirebaseMock{},
		Store:         fakeStore,
		Subscriptions: testServer.Subscriptions,
		Connections:   testServer.Connections,
		Origin:        "*",
	})
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	require.NoError(t, err, "cannot listen on test server address")

	httpServer := httptest.NewUnstartedServer(server.New("127.0.0.1:0", "*", websocketHandler).Handler)
	httpServer.Listener = listener
	httpServer.Start()
	testServerAddr = strings.TrimPrefix(httpServer.URL, "http://")

	stopServer := func() {
		httpServer.Close()
	}
	return stopServer, fakeStore, testServer
}
