package server

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/EveryBoard/EveryBoard/internal/everyboard/store"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type gameStoreStub struct {
	store.GameStore
	games []model.Game
	err   error
}

func (s gameStoreStub) ListGames() ([]model.Game, error) {
	return s.games, s.err
}

func TestGames(t *testing.T) {
	game := model.Game{
		GameID:    42,
		GameName:  "P4",
		Result:    model.ResultVictoryOfZero,
		Beginning: 123,
	}
	server := New("127.0.0.1:0", "https://everyboard.org/", http.NotFoundHandler(), gameStoreStub{
		games: []model.Game{game},
	})
	request := httptest.NewRequest(http.MethodGet, "/api/games", nil)
	recorder := httptest.NewRecorder()

	server.Handler.ServeHTTP(recorder, request)

	require.Equal(t, http.StatusOK, recorder.Code)
	assert.Equal(t, "application/json", recorder.Header().Get("Content-Type"))
	assert.JSONEq(t, `[{"gameName":"P4","playerZero":{"id":"","name":""},"playerZeroElo":0,"playerOne":{"id":"","name":""},"playerOneElo":0,"result":"VictoryOfZero","beginning":123,"url":"https://everyboard.org/play/P4/JgaEB"}]`, recorder.Body.String())
}

func TestGamesEmptyListIsArray(t *testing.T) {
	server := New("127.0.0.1:0", "https://everyboard.org", http.NotFoundHandler(), gameStoreStub{})
	recorder := httptest.NewRecorder()

	server.Handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/games", nil))

	require.Equal(t, http.StatusOK, recorder.Code)
	assert.JSONEq(t, `[]`, recorder.Body.String())
}

func TestGamesErrors(t *testing.T) {
	t.Run("MethodNotAllowed", func(t *testing.T) {
		server := New("127.0.0.1:0", "*", http.NotFoundHandler(), gameStoreStub{})
		recorder := httptest.NewRecorder()
		server.Handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodPost, "/api/games", nil))
		assert.Equal(t, http.StatusMethodNotAllowed, recorder.Code)
		assert.Equal(t, http.MethodGet, recorder.Header().Get("Allow"))
	})

	t.Run("StoreFailure", func(t *testing.T) {
		server := New("127.0.0.1:0", "*", http.NotFoundHandler(), gameStoreStub{err: errors.New("failed")})
		recorder := httptest.NewRecorder()
		server.Handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/games", nil))
		assert.Equal(t, http.StatusInternalServerError, recorder.Code)
	})
}
