package handler

import (
	"encoding/json"
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/apperror"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/session"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/store"
	"github.com/gorilla/websocket"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
)

func TestSubscribeConfigRoomPayload(t *testing.T) {
	gameIDJSON, err := model.GameID(42).MarshalJSON()
	require.NoError(t, err)

	tests := []struct {
		name                  string
		messageData           map[string]json.RawMessage
		expectedBotIdentifier *model.BotIdentifier
		expectedError         error
	}{
		{
			name:                  "OmittedBotIdentifierIsNil",
			messageData:           map[string]json.RawMessage{"gameId": gameIDJSON},
			expectedBotIdentifier: nil,
			expectedError:         nil,
		},
		{
			name: "ExplicitNullBotIdentifierIsNil",
			messageData: map[string]json.RawMessage{
				"gameId":        gameIDJSON,
				"botIdentifier": json.RawMessage(`null`),
			},
			expectedBotIdentifier: nil,
			expectedError:         nil,
		},
		{
			name: "ValidBotIdentifierIsDecoded",
			messageData: map[string]json.RawMessage{
				"gameId": gameIDJSON,
				"botIdentifier": json.RawMessage(
					`{"displayName":"Perfect P4","parameters":{"version":"1.0"}}`,
				),
			},
			expectedBotIdentifier: &model.BotIdentifier{
				DisplayName: "Perfect P4",
				Parameters:  json.RawMessage(`{"version":"1.0"}`),
			},
			expectedError: nil,
		},
		{
			name: "MalformedBotIdentifierIsRejected",
			messageData: map[string]json.RawMessage{
				"gameId":        gameIDJSON,
				"botIdentifier": json.RawMessage(`{"displayName":42,"parameters":{}}`),
			},
			expectedBotIdentifier: nil,
			expectedError:         apperror.ErrorInvalidData,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			// Given message data with an optional bot identifier
			actual := subscribeConfigRoomPayload{
				GameID:        0,
				BotIdentifier: nil,
			}

			// When decoding the subscription payload
			err := withMessagePayload(test.messageData, func(payload subscribeConfigRoomPayload) error {
				actual = payload
				return nil
			})

			// Then the identifier should be decoded or rejected as expected
			assert.Equal(t, test.expectedError, err)
			if test.expectedError == nil {
				assert.Equal(t, model.GameID(42), actual.GameID)
				assert.Equal(t, test.expectedBotIdentifier, actual.BotIdentifier)
			}
		})
	}
}

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
		store.SetCurrentGame(&model.CurrentGame{User: user, GameID: 1})
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
