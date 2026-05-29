package handler

import (
	"encoding/json"
	"github.com/stretchr/testify/assert"
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/apperror"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/session"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/store"
	"github.com/gorilla/websocket"
	"gorm.io/driver/sqlite"
)

func TestHandlersDirectEdgeCases(t *testing.T) {
	store, _ := store.InitDatabase(sqlite.Open(":memory:"))
	user := model.MinimalUser{ID: "user1", Name: "user1"}

	newH := func() Handler {
		subs := session.NewSubscriptionManager[*websocket.Conn]()
		cm := session.NewConnectionManager[*websocket.Conn]()
		return Handler{
			connection:    &websocket.Conn{}, // Non-nil to be safe
			user:          user,
			store:         store,
			connections:   &cm,
			subscriptions: &subs,
		}
	}

	t.Run("HandleUnsubscribeNotSubscribed", func(t *testing.T) {
		// Given a handler where we did not subscribe
		h := newH()
		// When calling unsubscribe
		err := h.unsubscribe()
		// Then it should not result in an error
		assert.Nil(t, err, "unexpected error")
	})

	t.Run("HandleSubscribeGameDoesNotExist", func(t *testing.T) {
		// Given a handler
		h := newH()
		// When we subscribe to a non existing game
		err := h.handleSubscribeGame(model.GameID(999))
		// Then it should fail
		assert.Equal(t, apperror.ErrorGameDoesNotExist, err, "expected ErrorGameDoesNotExist")
	})

	t.Run("HandleSubscribeLobby", func(t *testing.T) {
		// Given a handler
		h := newH()
		// When we subscribe to the lobby
		err := h.handleSubscribeLobby()
		// Then it should succeed
		assert.Nil(t, err, "unexpected error")
	})

	t.Run("HandleCreateAlreadyInGame", func(t *testing.T) {
		h := newH()
		store.SetCurrentGame(&model.CurrentGame{UserID: user.ID, UserName: user.Name, GameID: 1})
		err := h.handleWithoutErrorSend("Create", map[string]json.RawMessage{"gameName": json.RawMessage(`"test"`)})
		assert.Equal(t, apperror.ErrorAlreadySubscribed, err, "expected ErrorAlreadySubscribed")
	})

	t.Run("HandleSelectOpponentNotSubscribed", func(t *testing.T) {
		h := newH()
		err := h.handleWithoutErrorSend("SelectOpponent", map[string]json.RawMessage{"opponent": json.RawMessage(`{"id":"other"}`)})
		assert.Equal(t, apperror.ErrorNotSubscribed, err, "expected ErrorNotSubscribed")
	})
}

func TestUnsubscribeDirect(t *testing.T) {
	store, _ := store.InitDatabase(sqlite.Open(":memory:"))
	user := model.MinimalUser{ID: "user1", Name: "user1"}
	subs := session.NewSubscriptionManager[*websocket.Conn]()
	cm := session.NewConnectionManager[*websocket.Conn]()
	h := Handler{
		connection:    &websocket.Conn{},
		user:          user,
		store:         store,
		connections:   &cm,
		subscriptions: &subs,
	}

	t.Run("Lobby", func(t *testing.T) {
		subs.Subscribe(h.connection, user.ID, model.GameIDLobby, session.SubscriptionToLobby)
		err := h.unsubscribe()
		assert.Nil(t, err, "unexpected error")
	})
}
