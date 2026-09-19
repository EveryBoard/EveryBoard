package ws

import (
	"encoding/json"
	"testing"

	"github.com/EveryBoard/EveryBoard/internal/everyboard/model"
)

func TestGameFlow(t *testing.T) {
	sb := NewScenarioBuilder(t)
	player := sb.EstablishConnection("player")
	opponent := sb.EstablishConnection("opponent")

	sb.SubscribeLobby(opponent)              // opponent opens lobby
	gameId := sb.Create(player, "P4")        // player creates game
	sb.SubscribeConfigRoom(player, gameId)   // player subscribes to the config room
	sb.Unsubscribe(opponent)                 // opponent unsubscribes from the lobby
	sb.SubscribeConfigRoom(opponent, gameId) // opponent subscribes to the config room
	sb.SelectOpponent(player, opponent)      // player selects the opponent
	proposal := model.ConfigProposal{
		GameType:     model.GameTypeStandard,
		MoveDuration: 120,
		GameDuration: 1800,
		FirstPlayer:  model.FirstPlayerRandom,
		RulesConfig:  json.RawMessage(`null`),
	}
	sb.ProposeConfig(player, proposal)             // player proposes to the opponent
	sb.ReviewConfig(player)                        // player reviews the config
	sb.ProposeConfig(player, proposal)             // player proposes the config again
	sb.AcceptConfig(opponent)                      // opponent accepts (the game starts)
	sb.Unsubscribe(player)                         // player unsubscribes from the config room
	sb.Unsubscribe(opponent)                       // opponent unsubscribes from the config room
	sb.SubscribeGame(player, gameId)               // player subscribes to the game
	sb.SubscribeGame(opponent, gameId)             // opponent subscribes to the game
	observer := sb.EstablishConnection("observer") // an observer joins
	sb.SubscribeGame(observer, gameId)             // the observer subscribes to the game
	sb.Move(player, json.RawMessage(`{"x":42}`))   // player plays one move
	sb.ProposeDraw(opponent)                       // opponent proposes draw
	sb.AcceptDraw(player)                          // player accepts

	sb.ProposeRematch(player)           // player proposes a rematch
	gameId = sb.AcceptRematch(opponent) // opponent accepts the rematch
	sb.Unsubscribe(player)              // player leaves the finished game
	sb.Unsubscribe(opponent)            // opponent too
	sb.SubscribeGame(player, gameId)    // player joins the rematch
	sb.SubscribeGame(opponent, gameId)  // opponent too
	sb.Resign(player)                   // player resigns

	sb.Cleanup()
}

func setupTwoPlayersGame(t *testing.T) (ScenarioBuilder, string, string, model.GameID) {
	sb := NewScenarioBuilder(t)
	player := sb.EstablishConnection("player")
	opponent := sb.EstablishConnection("opponent")
	gameId := sb.Create(player, "P4")        // player creates game
	sb.SubscribeConfigRoom(player, gameId)   // player subscribes to the config room
	sb.SubscribeConfigRoom(opponent, gameId) // opponent subscribes to the config room
	sb.SelectOpponent(player, opponent)      // player selects the opponent
	proposal := model.ConfigProposal{
		GameType:     model.GameTypeStandard,
		MoveDuration: 120,
		GameDuration: 1800,
		FirstPlayer:  model.FirstPlayerRandom,
		RulesConfig:  json.RawMessage(`null`),
	}
	sb.ProposeConfig(player, proposal) // player proposes to the opponent
	sb.AcceptConfig(opponent)          // opponent accepts (the game starts)
	sb.Unsubscribe(player)             // player unsubscribes from the config room
	sb.Unsubscribe(opponent)           // opponent unsubscribes from the config room
	sb.SubscribeGame(player, gameId)   // player subscribes to the game
	sb.SubscribeGame(opponent, gameId) // opponent subscribes to the game
	return sb, player, opponent, gameId
}
