package internal

import model "github.com/EveryBoard/EveryBoard/internal/model"

type Store interface {
	GetConfigRoom(gameId model.GameID) (*model.ConfigRoom, error)
	CreateConfigRoom(creator model.MinimalUser, gameName string) (*model.ConfigRoom, error)
	DeleteConfigRoom(configRoom model.ConfigRoom) error
	SelectOpponent(configRoom *model.ConfigRoom, opponent model.MinimalUser) error
	RemoveOpponent(configRoom *model.ConfigRoom) error
	ProposeConfig(configRoom *model.ConfigRoom, config model.ConfigProposal) error
	ReviewConfig(configRoom *model.ConfigRoom) error
	StartConfigRoom(configRoom *model.ConfigRoom) error
	FinishConfigRoom(configRoom *model.ConfigRoom) error
	CreateRematch(configRoom model.ConfigRoom, creator model.MinimalUser, game model.Game) (*model.ConfigRoom, error)
	ApplyToConfigRooms(action func(model.ConfigRoom) error) error
	AddCandidate(configRoom model.ConfigRoom, user model.MinimalUser, elo float64) error
	DeleteCandidate(configRoom model.ConfigRoom, uid string) error
	ApplyToCandidates(gameId model.GameID, action func(model.Candidate) error) error
	GetGame(gameId model.GameID) (*model.Game, error)
	CreateGame(configRoom *model.ConfigRoom, now int64, randBool bool) (*model.Game, error)
	SetGameResult(game *model.Game, result model.Result) error
	AddEvent(gameId model.GameID, event model.GameEvent) error
	ApplyToGameEvents(gameId model.GameID, action func(*model.GameEvent) error) error
	GetElo(gameName string, user model.MinimalUser) (*model.Elo, error)
	GetElos(gameName string, winner model.MinimalUser, loser model.MinimalUser) (*model.Elo, *model.Elo, error)
	UpdateElos(gameName string, winner model.MinimalUser, winnerElo model.Elo, loser model.MinimalUser, loserElo model.Elo) error
	GetCurrentGame(user model.MinimalUser) (*model.CurrentGame, error)
	SetCurrentGame(currentGame model.CurrentGame) error
	UpdateCurrentGame(user model.MinimalUser, currentGame model.CurrentGame) error
	RemoveCurrentGame(user model.MinimalUser) error
	AddChatMessage(gameId model.GameID, message *model.Message) error
	ApplyToMessagesOfGame(gameId model.GameID, action func(*model.Message) error) error
	ApplyToObservers(gameId model.GameID, action func(model.MinimalUser) error) error
}
