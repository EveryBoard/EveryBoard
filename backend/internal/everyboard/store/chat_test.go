package store

import (
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"gorm.io/driver/sqlite"
)

func TestChatMessageFlow(t *testing.T) {
	// Given a db
	store, err := InitDatabase(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("cannot initialize db: %v", err)
	}
	user := model.MinimalUser{ID: "foo", Name: "foo"}
	message1 := model.Message{
		Sender:    user,
		Timestamp: 1,
		Content:   "hello",
	}
	message2 := model.Message{
		Sender:    user,
		Timestamp: 2,
		Content:   "world",
	}
	// When adding messages
	err = store.AddChatMessage(42, &message1)
	if err != nil {
		t.Fatalf("cannot add chat message: %v", err)
	}

	err = store.AddChatMessage(42, &message2)
	if err != nil {
		t.Fatalf("cannot add chat message: %v", err)
	}

	// Then they should be added and can be retrieved in timestamp order
	seenMessages := []model.Message{}
	err = store.ApplyToMessagesOfGame(42, func(m *model.Message) error {
		seenMessages = append(seenMessages, *m)
		return nil
	})
	if err != nil {
		t.Fatalf("cannot apply to messages: %v", err)
	}
	if len(seenMessages) != 2 {
		t.Fatalf("should have seen 2 messages, but I've seen %d instead", len(seenMessages))
	}
	if seenMessages[0].Timestamp >= seenMessages[1].Timestamp {
		t.Fatalf("messages should be ordered by timestamp but are not")
	}
}
