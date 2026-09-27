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

func newTestHandler(
	t *testing.T,
	user model.MinimalUser,
) (Handler, *store.GORMStore) {
	t.Helper()
	database, err := store.InitDatabase(sqlite.Open(":memory:"))
	require.NoError(t, err, "cannot initialize database")
	subs := session.NewSubscriptionManager[*websocket.Conn]()
	connections := session.NewConnectionManager[*websocket.Conn]()
	return Handler{
		connection:    &websocket.Conn{},
		user:          user,
		store:         database,
		connections:   &connections,
		subscriptions: &subs,
	}, database
}

func TestHandleCreateGamePersistsBotIdentifier(t *testing.T) {
	// Given a bot handler and a bot identifier
	bot := model.MinimalUser{ID: "bot", Name: "bot", IsBot: true}
	h, database := newTestHandler(t, bot)
	botIdentifier := &model.BotIdentifier{
		DisplayName: "Perfect P4",
		Parameters:  json.RawMessage(`{"version":1}`),
	}

	// When the bot creates a game and resends its identifier when subscribing
	err := h.handleCreateGame("P4", botIdentifier)
	require.NoError(t, err, "bot should be allowed to create a game")
	var persistedRooms []model.ConfigRoom
	err = database.ApplyToConfigRooms(func(configRoom model.ConfigRoom) error {
		persistedRooms = append(persistedRooms, configRoom)
		return nil
	})
	require.NoError(t, err, "cannot retrieve config rooms")
	require.Len(t, persistedRooms, 1)
	err = h.handleSubscribeConfigRoom(persistedRooms[0].ID, botIdentifier)
	require.NoError(t, err, "bot creator should be allowed to subscribe with its identifier")

	// Then the creator identifier should be persisted
	assert.Equal(t, botIdentifier, persistedRooms[0].CreatorBotIdentifier)
}

func TestHandleSubscribeConfigRoomPersistsBotIdentifier(t *testing.T) {
	// Given a config room and a bot candidate
	bot := model.MinimalUser{ID: "bot", Name: "bot", IsBot: true}
	h, database := newTestHandler(t, bot)
	creator := model.MinimalUser{ID: "creator", Name: "creator", IsBot: false}
	configRoom, err := database.CreateConfigRoom(creator, "P4", nil)
	require.NoError(t, err, "cannot create config room")
	botIdentifier := &model.BotIdentifier{
		DisplayName: "Perfect P4",
		Parameters:  json.RawMessage(`{"version":1}`),
	}

	// When the bot subscribes as a candidate
	err = h.handleSubscribeConfigRoom(configRoom.ID, botIdentifier)
	require.NoError(t, err, "bot should be allowed to subscribe")
	var persistedCandidates []model.Candidate
	err = database.ApplyToCandidates(configRoom.ID, func(candidate model.Candidate) error {
		persistedCandidates = append(persistedCandidates, candidate)
		return nil
	})
	require.NoError(t, err, "cannot retrieve candidates")

	// Then the candidate identifier should be persisted
	require.Len(t, persistedCandidates, 1)
	assert.Equal(t, botIdentifier, persistedCandidates[0].BotIdentifier)
}

func TestHandleBotIdentifierValidation(t *testing.T) {
	botIdentifier := &model.BotIdentifier{
		DisplayName: "Perfect P4",
		Parameters:  json.RawMessage(`{"version":1}`),
	}
	tests := []struct {
		name          string
		user          model.MinimalUser
		botIdentifier *model.BotIdentifier
	}{
		{
			name:          "BotWithoutIdentifier",
			user:          model.MinimalUser{ID: "bot", Name: "bot", IsBot: true},
			botIdentifier: nil,
		},
		{
			name:          "HumanWithIdentifier",
			user:          model.MinimalUser{ID: "human", Name: "human", IsBot: false},
			botIdentifier: botIdentifier,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			// Given a handler whose user and bot identifier do not match
			h, _ := newTestHandler(t, test.user)

			// When the user tries to create a game or subscribe to a config room
			createErr := h.handleCreateGame("P4", test.botIdentifier)
			subscribeErr := h.handleSubscribeConfigRoom(42, test.botIdentifier)

			// Then the declaration should be rejected
			assert.Equal(t, apperror.ErrorInvalidData, createErr)
			assert.Equal(t, apperror.ErrorInvalidData, subscribeErr)
		})
	}
}

func TestHandlersDirectEdgeCases(t *testing.T) {
	user := model.MinimalUser{ID: "user1", Name: "user1"}

	t.Run("HandleUnsubscribeNotSubscribed", func(t *testing.T) {
		// Given a handler where we did not subscribe
		h, _ := newTestHandler(t, user)
		// When calling unsubscribe
		err := h.unsubscribe()
		// Then it should not result in an error
		assert.Nil(t, err, "unexpected error")
	})

	t.Run("HandleSubscribeGameDoesNotExist", func(t *testing.T) {
		// Given a handler
		h, _ := newTestHandler(t, user)
		// When we subscribe to a non existing game
		err := h.handleSubscribeGame(model.GameID(999))
		// Then it should fail
		assert.Equal(t, apperror.ErrorGameDoesNotExist, err, "expected ErrorGameDoesNotExist")
	})

	t.Run("HandleSubscribeLobby", func(t *testing.T) {
		// Given a handler
		h, _ := newTestHandler(t, user)
		// When we subscribe to the lobby
		err := h.handleSubscribeLobby()
		// Then it should succeed
		assert.Nil(t, err, "unexpected error")
	})

	t.Run("HandleCreateAlreadyInGame", func(t *testing.T) {
		h, database := newTestHandler(t, user)
		database.SetCurrentGame(&model.CurrentGame{User: user, GameID: 1})
		err := h.handleWithoutErrorSend("Create", map[string]json.RawMessage{"gameName": json.RawMessage(`"test"`)})
		assert.Equal(t, apperror.ErrorAlreadySubscribed, err, "expected ErrorAlreadySubscribed")
	})

	t.Run("HandleSelectOpponentNotSubscribed", func(t *testing.T) {
		h, _ := newTestHandler(t, user)
		err := h.handleWithoutErrorSend("SelectOpponent", map[string]json.RawMessage{"opponent": json.RawMessage(`{"id":"other"}`)})
		assert.Equal(t, apperror.ErrorNotSubscribed, err, "expected ErrorNotSubscribed")
	})
}

func TestUnsubscribeDirect(t *testing.T) {
	user := model.MinimalUser{ID: "user1", Name: "user1"}
	h, _ := newTestHandler(t, user)

	t.Run("Lobby", func(t *testing.T) {
		h.subscriptions.Subscribe(h.connection, user.ID, model.GameIDLobby, session.SubscriptionToLobby)
		err := h.unsubscribe()
		assert.Nil(t, err, "unexpected error")
	})
}
