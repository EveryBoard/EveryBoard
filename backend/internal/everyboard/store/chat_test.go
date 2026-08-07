package store

import (
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
)

func TestChatMessageFlow(t *testing.T) {
	// Given a db
	store, err := InitDatabase(sqlite.Open(":memory:"))
	require.NoError(t, err, "cannot initialize db")
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
	require.NoError(t, err, "cannot add chat message")

	err = store.AddChatMessage(42, &message2)
	require.NoError(t, err, "cannot add chat message")

	// Then they should be added and can be retrieved in timestamp order
	seenMessages := []model.Message{}
	err = store.ApplyToMessagesOfGame(42, func(m *model.Message) error {
		seenMessages = append(seenMessages, *m)
		return nil
	})
	require.NoError(t, err, "cannot iterate chat messages")
	require.Equal(t, 2, len(seenMessages), "there are missing or too many chat messages")
	require.Less(t, seenMessages[0].Timestamp, seenMessages[1].Timestamp, "chat messages should be ordered by timestamp")
}
