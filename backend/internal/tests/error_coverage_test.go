package internal

import (
	"testing"

	everyboard "github.com/EveryBoard/EveryBoard/internal"
	"github.com/EveryBoard/EveryBoard/internal/model"
)

func TestRecoverMiddleware(t *testing.T) {
	err := everyboard.RecoverMiddleware("testuser", func() error {
		panic("something went wrong")
	})
	if err != model.ErrorInternal {
		t.Errorf("expected ErrorInternal, got %v", err)
	}
}

func TestHandleErrorsSimple(t *testing.T) {
	sb := NewScenarioBuilder(t)
	defer sb.Cleanup()

	user1 := sb.EstablishConnection("user1")
	conn1 := sb.getConnection(user1)

	// 1. Unknown message
	sendMessage(t, conn1, `["Unknown"]`)
	expectMessage(t, conn1, `["Error",{"reason":"unknown-message"}]`)

	// 2. Invalid data
	sendMessage(t, conn1, `["SubscribeConfigRoom",{"gameId":123}]`)
	expectMessage(t, conn1, `["Error",{"reason":"invalid-data"}]`)

	// 3. Already subscribed to lobby
	sendMessage(t, conn1, `["SubscribeLobby"]`)
	// Try again
	sendMessage(t, conn1, `["SubscribeLobby"]`)
	expectMessage(t, conn1, `["Error",{"reason":"already-subscribed"}]`)

	// 4. Create while subscribed
	sendMessage(t, conn1, `["Create",{"gameName":"p4"}]`)
	expectMessage(t, conn1, `["Error",{"reason":"already-subscribed"}]`)
}

func TestForbiddenActions(t *testing.T) {
	sb := NewScenarioBuilder(t)
	defer sb.Cleanup()

	creator := sb.EstablishConnection("creator")
	gameId := sb.Create(creator, "p4")
	sb.SubscribeConfigRoom(creator, gameId)
	conn := sb.getConnection(creator)

	// 1. ReviewConfig when not proposed
	sendMessage(t, conn, `["ReviewConfig"]`)
	expectMessage(t, conn, `["Error",{"reason":"not-allowed"}]`)

	// 2. AcceptConfig when not proposed
	sendMessage(t, conn, `["AcceptConfig"]`)
	expectMessage(t, conn, `["Error",{"reason":"not-allowed"}]`)
}
