package internal

import (
	"github.com/gorilla/websocket"
	"net/http"
	"testing"
)

func TestMessageArgumentErrorsExpansion(t *testing.T) {
	stopServer, _, _ := PrepareServer(t)
	defer stopServer()

	dial := func(uid string) *websocket.Conn {
		headers := http.Header{}
		headers.Set("Sec-WebSocket-Protocol", tokenForUser(uid))
		c, _, err := websocket.DefaultDialer.Dial("ws://localhost:8081/ws", headers)
		if err != nil {
			t.Fatalf("Dial failed: %v", err)
		}
		readWithTimeout(t, c)
		return c
	}

	c := dial("user1")
	defer c.Close()

	tests := []struct {
		name string
		msg  string
	}{
		{"SubscribeConfigRoomMissing", `["SubscribeConfigRoom",{}]`},
		{"SubscribeGameMissing", `["SubscribeGame",{}]`},
		{"ChatSendMissing", `["ChatSend",{}]`},
		{"CreateMissing", `["Create",{}]`},
		{"SelectOpponentMissing", `["SelectOpponent",{}]`},
		{"ProposeConfigMissing", `["ProposeConfig",{}]`},
		{"NotifyTimeoutMissing", `["NotifyTimeout",{}]`},
		{"EndGameMissing", `["EndGame",{}]`},
		{"ProposeMissing", `["Propose",{}]`},
		{"RejectMissing", `["Reject",{}]`},
		{"AcceptMissing", `["Accept",{}]`},
		{"AddTimeMissing", `["AddTime",{}]`},
		{"MoveMissing", `["Move",{}]`},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := c.WriteMessage(websocket.TextMessage, []byte(tt.msg))
			if err != nil {
				t.Fatalf("WriteMessage failed: %v", err)
			}
			msg := readWithTimeout(t, c)
			if msg == nil {
				t.Fatal("expected error message")
			}
		})
	}
}
