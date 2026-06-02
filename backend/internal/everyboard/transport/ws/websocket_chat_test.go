package ws

import (
	"testing"
)

func TestSendChatMessage(t *testing.T) {
	// Given a game
	sb, player, opponent, _ := setupTwoPlayersGame(t)
	defer sb.Cleanup()

	// When sending a chat message
	sendRawMessage(t, sb.getConnection(player), `["ChatSend",{"message":"hello"}]`)
	// Then it should be sent to both players
	expectMessage(t, sb.getConnection(player), `["ChatMessage",{"message":{"sender":{"id":"player","name":"player"},"timestamp":42,"content":"hello"}}]`)
	expectMessage(t, sb.getConnection(opponent), `["ChatMessage",{"message":{"sender":{"id":"player","name":"player"},"timestamp":42,"content":"hello"}}]`)
}

func TestSendChatMessageTooLong(t *testing.T) {
	// Given a game
	sb, player, _, _ := setupTwoPlayersGame(t)
	defer sb.Cleanup()

	// When sending a too long chat message
	sendRawMessage(t, sb.getConnection(player), `["ChatSend",{"message":"this message is too long to be allowed in the chat because we restrict the messages to 128 characters. This is checked both in the frontend and the backend. Without this, a malicious user could send a message of unbounded length, which would bloat the db and this is not something we want"}]`)
	// Then it should be disallowed
	expectMessage(t, sb.getConnection(player), `["Error",{"reason":"not-allowed"}]`)
}
