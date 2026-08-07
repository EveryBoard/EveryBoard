package ws

import (
	"net/http"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/auth"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/session"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/store"
	"github.com/gorilla/websocket"
)

type Dependencies struct {
	Firebase      auth.FirebaseLike
	Store         store.Store
	Subscriptions *session.SubscriptionManager[*websocket.Conn]
	Connections   *session.ConnectionManager[*websocket.Conn]
	Origin        string
}

func newUpgrader(origin string) websocket.Upgrader {
	return websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return origin == "*" || r.Header.Get("Origin") == origin
		},
		Subprotocols: []string{"Authorization"},
	}
}
