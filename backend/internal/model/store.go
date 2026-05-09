package model

type ConfigRoomStore interface {
	GetConfigRoom(gameId GameID) (*ConfigRoom, error)
	CreateConfigRoom(creator MinimalUser, gameName string) (*ConfigRoom, error)
	DeleteConfigRoom(configRoom *ConfigRoom) error
	SelectOpponent(configRoom *ConfigRoom, opponent MinimalUser) error
	RemoveOpponent(configRoom *ConfigRoom) error
	ProposeConfig(configRoom *ConfigRoom, config ConfigProposal) error
	ReviewConfig(configRoom *ConfigRoom) error
	StartConfigRoom(configRoom *ConfigRoom) error
	FinishConfigRoom(configRoom *ConfigRoom) error
	CreateRematch(configRoom *ConfigRoom, creator MinimalUser, game *Game) (*ConfigRoom, error)
	ApplyToConfigRooms(action func(ConfigRoom) error) error
	AddCandidate(configRoom *ConfigRoom, user MinimalUser, elo float64) error
	DeleteCandidate(configRoom *ConfigRoom, uid string) error
	ApplyToCandidates(gameId GameID, action func(Candidate) error) error
}

type GameStore interface {
	GetGame(gameId GameID) (*Game, error)
	CreateGame(configRoom *ConfigRoom, now int64, randBool bool) (*Game, error)
	SetGameResult(game *Game, result Result) error
	AddEvent(gameId GameID, event *GameEvent) error
	ApplyToGameEvents(gameId GameID, action func(*GameEvent) error) error
	ApplyToObservers(gameId GameID, action func(MinimalUser) error) error
}

type EloStore interface {
	GetElo(gameName string, user MinimalUser) (*Elo, error)
	GetElos(gameName string, winner MinimalUser, loser MinimalUser) (*Elo, *Elo, error)
	UpdateElos(gameName string, winner MinimalUser, winnerElo Elo, loser MinimalUser, loserElo Elo) error
}

type CurrentGameStore interface {
	GetCurrentGame(user MinimalUser) (*CurrentGame, error)
	SetCurrentGame(currentGame *CurrentGame) error
	UpdateCurrentGame(user MinimalUser, currentGame *CurrentGame) error
	RemoveCurrentGame(user MinimalUser) error
}

type ChatStore interface {
	AddChatMessage(gameId GameID, message *Message) error
	ApplyToMessagesOfGame(gameId GameID, action func(*Message) error) error
}

type Store interface {
	Transaction(fn func(store Store) error) error

	ConfigRoomStore
	GameStore
	EloStore
	CurrentGameStore
	ChatStore
}
