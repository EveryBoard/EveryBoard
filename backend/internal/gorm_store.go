package internal

import model "github.com/EveryBoard/EveryBoard/internal/model"

type GORMStore struct{}

func (s GORMStore) GetConfigRoom(gameId model.GameID) (*model.ConfigRoom, error) {
	return model.GetConfigRoom(gameId)
}

func (s GORMStore) CreateConfigRoom(creator model.MinimalUser, gameName string) (*model.ConfigRoom, error) {
	return model.CreateConfigRoom(creator, gameName)
}

func (s GORMStore) DeleteConfigRoom(configRoom model.ConfigRoom) error {
	return configRoom.Delete()
}

func (s GORMStore) SelectOpponent(configRoom *model.ConfigRoom, opponent model.MinimalUser) error {
	return configRoom.SelectOpponent(opponent)
}

func (s GORMStore) RemoveOpponent(configRoom *model.ConfigRoom) error {
	return configRoom.RemoveOpponent()
}

func (s GORMStore) ProposeConfig(configRoom *model.ConfigRoom, config model.ConfigProposal) error {
	return configRoom.Propose(config)
}

func (s GORMStore) ReviewConfig(configRoom *model.ConfigRoom) error {
	return configRoom.Review()
}

func (s GORMStore) StartConfigRoom(configRoom *model.ConfigRoom) error {
	return configRoom.Start()
}

func (s GORMStore) FinishConfigRoom(configRoom *model.ConfigRoom) error {
	return configRoom.Finish()
}

func (s GORMStore) CreateRematch(configRoom model.ConfigRoom, creator model.MinimalUser, game model.Game) (*model.ConfigRoom, error) {
	return configRoom.CreateRematch(creator, game)
}

func (s GORMStore) ApplyToConfigRooms(action func(model.ConfigRoom) error) error {
	return model.ApplyToConfigRooms(action)
}

func (s GORMStore) AddCandidate(configRoom model.ConfigRoom, user model.MinimalUser, elo float64) error {
	return configRoom.AddCandidate(user, elo)
}

func (s GORMStore) DeleteCandidate(configRoom model.ConfigRoom, uid string) error {
	return configRoom.DeleteCandidate(uid)
}

func (s GORMStore) ApplyToCandidates(gameId model.GameID, action func(model.Candidate) error) error {
	return model.ApplyToCandidates(gameId, action)
}

func (s GORMStore) GetGame(gameId model.GameID) (*model.Game, error) {
	return model.GetGame(gameId)
}

func (s GORMStore) CreateGame(configRoom *model.ConfigRoom, now int64, randBool bool) (*model.Game, error) {
	return configRoom.CreateGame(now, randBool)
}

func (s GORMStore) SetGameResult(game *model.Game, result model.Result) error {
	return game.SetResult(result)
}

func (s GORMStore) AddEvent(gameId model.GameID, event model.GameEvent) error {
	return model.AddEvent(gameId, event)
}

func (s GORMStore) ApplyToGameEvents(gameId model.GameID, action func(*model.GameEvent) error) error {
	return model.ApplyToGameEvents(gameId, action)
}

func (s GORMStore) GetElo(gameName string, user model.MinimalUser) (*model.Elo, error) {
	return model.GetElo(gameName, user)
}

func (s GORMStore) GetElos(gameName string, winner model.MinimalUser, loser model.MinimalUser) (*model.Elo, *model.Elo, error) {
	return model.GetElos(gameName, winner, loser)
}

func (s GORMStore) UpdateElos(gameName string, winner model.MinimalUser, winnerElo model.Elo, loser model.MinimalUser, loserElo model.Elo) error {
	return model.UpdateElos(gameName, winner, winnerElo, loser, loserElo)
}

func (s GORMStore) GetCurrentGame(user model.MinimalUser) (*model.CurrentGame, error) {
	return model.GetCurrentGame(user)
}

func (s GORMStore) SetCurrentGame(currentGame model.CurrentGame) error {
	return model.SetCurrentGame(currentGame)
}

func (s GORMStore) UpdateCurrentGame(user model.MinimalUser, currentGame model.CurrentGame) error {
	return model.UpdateCurrentGame(user, currentGame)
}

func (s GORMStore) RemoveCurrentGame(user model.MinimalUser) error {
	return model.RemoveCurrentGame(user)
}

func (s GORMStore) AddChatMessage(gameId model.GameID, message *model.Message) error {
	return model.AddChatMessage(gameId, message)
}

func (s GORMStore) ApplyToMessagesOfGame(gameId model.GameID, action func(*model.Message) error) error {
	return model.ApplyToMessagesOfGame(gameId, action)
}

func (s GORMStore) ApplyToObservers(gameId model.GameID, action func(model.MinimalUser) error) error {
	return model.ApplyToObservers(gameId, action)
}
