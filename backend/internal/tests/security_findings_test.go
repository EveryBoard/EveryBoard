package internal

import (
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/model"
)

// FINDING 1: Missing Authorization on Game Events (Broken Access Control)
// An observer cannot send moves or propositions to a game they are only observing.

// FINDING 2: Missing Game State Validation (Broken Logic)
// Players can continue to send moves even after a game has finished (e.g., after resignation).
//func TestResignedPlayerCanStillMove_Vulnerability(t *testing.T) {
//	sb, player, opponent, gameId := setupTwoPlayersGame(t)
//	defer sb.Cleanup()
//
//	// Player resigns
//	sb.Resign(player)
//
//	// Player 1 (the winner) sends a move AFTER the game is resigned.
//	// This proves the server doesn't check the game status before accepting events.
//	// The move IS added since doEndGame allows timeout on a finished game,
//	// but addEvent doesn't check game.Result.
//	eventsBefore := len(sb.fakeStore.Events[gameId])
//	sendMessage(t, sb.getConnection(opponent), `["Move",{"move":{"late_move":true}}]`)
//
//	// The late move was stored (vulnerability: no game-state check in addEvent)
//	eventsAfter := len(sb.fakeStore.Events[gameId])
//	if eventsAfter != eventsBefore+1 {
//		t.Errorf("expected late move to be stored (vulnerability), but events went from %d to %d", eventsBefore, eventsAfter)
//	}
//}

// FINDING 3: Missing Validation on Event Game ID Context
// A lobby user cannot send moves (they have no game context).

// FINDING 4: Unbounded Chat Message Length (Denial of Service)
// func TestUnboundedChatMessageLength_Vulnerability(t *testing.T) {
// 	everyboard.Now = func() int64 { return 42 }
// 	stopServer, fakeStore := PrepareServer(t)
// 	defer stopServer()
//
// 	c := EstablishWebSocketConnection(t, "hacker")
// 	defer c.Close()
//
// 	sendMessage(t, c, `["SubscribeLobby"]`)
//
// 	hugeString := ""
// 	for i := 0; i < 1000; i++ {
// 		hugeString += "A"
// 	}
//
// 	sendMessage(t, c, fmt.Sprintf(`["ChatSend",{"message":"%s"}]`, hugeString))
//
// 	// Verify the huge message was stored
// 	messages := fakeStore.Messages[model.GameIDLobby]
// 	if len(messages) != 1 {
// 		t.Fatalf("expected 1 message stored, got %d", len(messages))
// 	}
// 	if messages[0].Content != hugeString {
// 		t.Fatalf("message content mismatch")
// 	}
//
// 	msg := *messages[0]
// 	expectedMsg, _ := json.Marshal([]any{"ChatMessage", model.ChatMessage{Message: msg}})
// 	expectMessage(t, c, string(expectedMsg))
// }

// ROBUSTNESS FINDING: Unbounded Message Queue
func TestUnboundedMessageQueue_Robustness(t *testing.T) {
	stopServer, _, config := PrepareServer(t)
	defer stopServer()

	c := EstablishWebSocketConnection(t, "victim")
	defer c.Close()

	for i := 0; i < 1000; i++ {
		config.Connections.SendMessage(c, model.ErrorMessage{Reason: model.ErrorUnknownMessage.Msg})
	}
}
