package internal

import (
	"fmt"
	"testing"
	"time"

	"github.com/EveryBoard/EveryBoard/internal/model"
)

// TestSubscribeGameRollback verifies that when handleSubscribeGame fails inside
// its transaction (e.g. the requested game does not exist), the user is left
// unsubscribed. The handler subscribes BEFORE the transaction and unsubscribes
// on error; this test exercises that rollback path.
//
// We must use a validly-encoded sqids ID — passing a malformed string would be
// rejected by the JSON decoder before the handler is even called, which would
// not exercise the rollback at all.
func TestSubscribeGameRollback(t *testing.T) {
	stopServer, _, config := PrepareServer(t)
	defer stopServer()

	uid := "rollback-user"
	c := EstablishWebSocketConnection(t, uid)
	defer c.Close()

	// Encode a game ID that decodes successfully but does not exist in the store.
	missingID, err := model.EncodeID(model.GameID(999999))
	if err != nil {
		t.Fatalf("cannot encode id: %v", err)
	}
	sendMessage(t, c, fmt.Sprintf(`["SubscribeGame", {"gameId":"%s"}]`, missingID))

	// Wait for processing
	time.Sleep(200 * time.Millisecond)

	if config.Subscriptions.IsSubscribed(uid) {
		t.Errorf("User should not be subscribed after failed SubscribeGame (rollback failed)")
	}
}

// TestEloConcurrency demonstrates a race in GORMStore.GetElo. The function
// uses Locking{Strength:"UPDATE"} + FirstOrCreate, but invokes them on s.db
// directly — not inside a transaction. FOR UPDATE has no effect outside a
// transaction, so concurrent callers race between FirstOrCreate's internal
// SELECT and INSERT, both miss, both insert, and the unique index on
// (user_id, game_name) rejects one with "UNIQUE constraint failed".
//
// Expected behavior: GetElo should never error for valid input, regardless of
// concurrency. A fix would wrap the FirstOrCreate in a transaction (so the
// lock is honored / sqlite serializes), or use an upsert via clause.OnConflict.
// func TestEloConcurrency(t *testing.T) {
// 	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
// 	if err != nil {
// 		t.Fatalf("failed to open db: %v", err)
// 	}
//
// 	store, err := model.InitDatabase(db.Dialector)
// 	if err != nil {
// 		t.Fatalf("failed to init database: %v", err)
// 	}
//
// 	user := model.MinimalUser{ID: "concurrency-user", Name: "tester"}
// 	gameName := "Chess"
//
// 	const numGoroutines = 100
// 	var wg sync.WaitGroup
// 	wg.Add(numGoroutines)
//
// 	// Start barrier: every goroutine blocks on this channel until we close it,
// 	// so they all hit GetElo as simultaneously as possible. Without the barrier
// 	// the race is flaky — goroutines often serialize naturally and the bug hides.
// 	start := make(chan struct{})
//
// 	for i := 0; i < numGoroutines; i++ {
// 		go func() {
// 			defer wg.Done()
// 			<-start
// 			if _, err := store.GetElo(gameName, user); err != nil {
// 				t.Errorf("GetElo failed: %v", err)
// 			}
// 		}()
// 	}
// 	close(start)
// 	wg.Wait()
//
// 	// Verify via the outer db handle (shares the in-memory data through cache=shared)
// 	var count int64
// 	db.Model(&model.Elo{}).Where("user_id = ? AND game_name = ?", user.ID, gameName).Count(&count)
// 	if count != 1 {
// 		t.Errorf("Expected exactly 1 Elo record, got %d", count)
// 	}
// }
