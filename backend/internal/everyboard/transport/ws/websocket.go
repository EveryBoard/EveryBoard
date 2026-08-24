package ws

import (
	"net/http"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/auth"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/logger"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/notification"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/session"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/store"
	"github.com/gorilla/websocket"
)

type Handler struct {
	firebase      auth.FirebaseLike
	store         store.Store
	subscriptions *session.SubscriptionManager[*websocket.Conn]
	connections   *session.ConnectionManager[*websocket.Conn]
	notifier      notification.Notifier
	upgrader      websocket.Upgrader
}

func New(dependencies Dependencies) *Handler {
	if dependencies.Notifier == nil {
		dependencies.Notifier = notification.Noop{}
	}
	return &Handler{
		firebase:      dependencies.Firebase,
		store:         dependencies.Store,
		subscriptions: dependencies.Subscriptions,
		connections:   dependencies.Connections,
		notifier:      dependencies.Notifier,
		upgrader:      newUpgrader(dependencies.Origin),
	}
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	minimalUser, err := h.authenticate(r)
	if err != nil {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	connection, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.Error.Printf("WebSocket upgrade error: %v", err)
		return
	}
	defer connection.Close()

	client := newClientSession(connection, minimalUser, h.store, h.connections, h.subscriptions, h.notifier)
	if err := client.start(); err != nil {
		logger.Error.Printf("cannot get current game: %v", err)
	}
}

func (h *Handler) authenticate(r *http.Request) (model.MinimalUser, error) {
	uid, user, err := auth.VerifyTokenAndGetUserWithClient(h.firebase, r)
	if err != nil {
		return model.MinimalUser{}, err
	}
	return model.MinimalUser{
		ID:    uid,
		Name:  user.Username,
		IsBot: user.IsBot,
	}, nil
}
