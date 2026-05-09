package internal

import (
	"fmt"

	"github.com/EveryBoard/EveryBoard/internal/model"
)

type FakeStore struct {
	ConfigRooms  map[model.GameID]*model.ConfigRoom
	Games        map[model.GameID]*model.Game
	Events       map[model.GameID][]model.GameEvent
	CurrentGames map[string]*model.CurrentGame
	Candidates   map[model.GameID][]model.Candidate
	Elos         map[string]map[string]*model.Elo
	Messages     map[model.GameID][]*model.Message
	nextID       model.GameID
}

func NewFakeStore() *FakeStore {
	lobby := &model.ConfigRoom{
		ID:          model.GameIDLobby,
		Creator:     model.MinimalUser{Name: "", ID: ""},
		CreatorElo:  0,
		Status:      model.StatusFinished,
		FirstPlayer: model.FirstPlayerRandom,
		GameType:    model.GameTypeStandard,
		RulesConfig: nil,
		GameName:    "lobby",
	}
	configRooms := map[model.GameID]*model.ConfigRoom{
		model.GameIDLobby: lobby,
	}
	return &FakeStore{
		ConfigRooms:  configRooms,
		Games:        make(map[model.GameID]*model.Game),
		Events:       make(map[model.GameID][]model.GameEvent),
		CurrentGames: make(map[string]*model.CurrentGame),
		Candidates:   make(map[model.GameID][]model.Candidate),
		Elos:         make(map[string]map[string]*model.Elo),
		Messages:     make(map[model.GameID][]*model.Message),
		nextID:       model.GameIDLobby,
	}
}

func (s *FakeStore) Transaction(fn func(store model.Store) error) error {
	return fn(s)
}

func (s *FakeStore) allocateID() model.GameID {
	s.nextID++
	return s.nextID
}

func (s *FakeStore) PeekNextID() model.GameID {
	return s.nextID + 1
}

func (s *FakeStore) GetConfigRoom(gameId model.GameID) (*model.ConfigRoom, error) {
	cr := s.ConfigRooms[gameId]
	return cr, nil
}

func (s *FakeStore) CreateConfigRoom(creator model.MinimalUser, gameName string) (*model.ConfigRoom, error) {
	creatorElo, err := s.GetElo(gameName, creator)
	if err != nil {
		return nil, err
	}
	id := s.allocateID()
	configRoom := &model.ConfigRoom{
		ID:                id,
		Creator:           creator,
		CreatorElo:        creatorElo.CurrentElo,
		FirstPlayer:       model.FirstPlayerRandom,
		ChosenOpponent:    nil,
		ChosenOpponentElo: nil,
		Status:            model.StatusCreated,
		GameType:          model.GameTypeStandard,
		MoveDuration:      model.StandardMoveDuration,
		GameDuration:      model.StandardGameDuration,
		RulesConfig:       nil,
		GameName:          gameName,
	}
	s.ConfigRooms[id] = configRoom
	return configRoom, nil
}

func (s *FakeStore) DeleteConfigRoom(configRoom *model.ConfigRoom) error {
	delete(s.ConfigRooms, configRoom.ID)
	return nil
}

func (s *FakeStore) SelectOpponent(configRoom *model.ConfigRoom, opponent model.MinimalUser) error {
	var candidateElo float64
	for _, c := range s.Candidates[configRoom.ID] {
		if c.User.ID == opponent.ID {
			candidateElo = c.Elo
			break
		}
	}
	configRoom.ChosenOpponent = &opponent
	configRoom.ChosenOpponentElo = &candidateElo
	return nil
}

func (s *FakeStore) RemoveOpponent(configRoom *model.ConfigRoom) error {
	configRoom.ChosenOpponent = nil
	configRoom.ChosenOpponentElo = nil
	return nil
}

func (s *FakeStore) ProposeConfig(configRoom *model.ConfigRoom, config model.ConfigProposal) error {
	configRoom.Status = model.StatusConfigProposed
	configRoom.GameType = config.GameType
	configRoom.MoveDuration = config.MoveDuration
	configRoom.GameDuration = config.GameDuration
	configRoom.FirstPlayer = config.FirstPlayer
	configRoom.RulesConfig = config.RulesConfig
	return nil
}

func (s *FakeStore) ReviewConfig(configRoom *model.ConfigRoom) error {
	configRoom.Status = model.StatusCreated
	return nil
}

func (s *FakeStore) StartConfigRoom(configRoom *model.ConfigRoom) error {
	configRoom.Status = model.StatusStarted
	return nil
}

func (s *FakeStore) FinishConfigRoom(configRoom *model.ConfigRoom) error {
	configRoom.Status = model.StatusFinished
	return nil
}

func (s *FakeStore) CreateRematch(configRoom *model.ConfigRoom, creator model.MinimalUser, game *model.Game) (*model.ConfigRoom, error) {
	creatorElo, err := s.GetElo(configRoom.GameName, creator)
	if err != nil {
		return nil, err
	}

	var firstPlayer model.FirstPlayer
	var chosenOpponent model.MinimalUser
	if game.PlayerZero.ID == creator.ID {
		firstPlayer = model.FirstPlayerChosenOpponent
		chosenOpponent = game.PlayerOne
	} else {
		firstPlayer = model.FirstPlayerCreator
		chosenOpponent = game.PlayerZero
	}

	chosenOpponentElo, err := s.GetElo(configRoom.GameName, chosenOpponent)
	if err != nil {
		return nil, err
	}

	id := s.allocateID()
	rematch := &model.ConfigRoom{
		ID:                id,
		Creator:           creator,
		CreatorElo:        creatorElo.CurrentElo,
		FirstPlayer:       firstPlayer,
		ChosenOpponent:    &chosenOpponent,
		ChosenOpponentElo: &chosenOpponentElo.CurrentElo,
		Status:            model.StatusStarted,
		GameType:          configRoom.GameType,
		MoveDuration:      configRoom.MoveDuration,
		GameDuration:      configRoom.GameDuration,
		RulesConfig:       configRoom.RulesConfig,
		GameName:          configRoom.GameName,
	}
	s.ConfigRooms[id] = rematch
	return rematch, nil
}

func (s *FakeStore) ApplyToConfigRooms(action func(model.ConfigRoom) error) error {
	for _, cr := range s.ConfigRooms {
		if cr.Status != model.StatusFinished {
			if err := action(*cr); err != nil {
				return err
			}
		}
	}
	return nil
}

func (s *FakeStore) AddCandidate(configRoom *model.ConfigRoom, user model.MinimalUser, elo float64) error {
	s.Candidates[configRoom.ID] = append(s.Candidates[configRoom.ID], model.Candidate{
		GameID: configRoom.ID,
		User:   user,
		Elo:    elo,
	})
	return nil
}

func (s *FakeStore) DeleteCandidate(configRoom *model.ConfigRoom, uid string) error {
	candidates := s.Candidates[configRoom.ID]
	for i, c := range candidates {
		if c.User.ID == uid {
			s.Candidates[configRoom.ID] = append(candidates[:i], candidates[i+1:]...)
			return nil
		}
	}
	return nil
}

func (s *FakeStore) ApplyToCandidates(gameId model.GameID, action func(model.Candidate) error) error {
	for _, c := range s.Candidates[gameId] {
		if err := action(c); err != nil {
			return err
		}
	}
	return nil
}

func (s *FakeStore) GetGame(gameId model.GameID) (*model.Game, error) {
	return s.Games[gameId], nil
}

func (s *FakeStore) CreateGame(configRoom *model.ConfigRoom, now int64, randBool bool) (*model.Game, error) {
	if configRoom.ChosenOpponent == nil {
		return nil, fmt.Errorf("cannot create a game if a config room has no opponent")
	}

	starter := configRoom.FirstPlayer
	if starter == model.FirstPlayerRandom {
		if randBool {
			starter = model.FirstPlayerCreator
		} else {
			starter = model.FirstPlayerChosenOpponent
		}
	}

	var playerZero model.MinimalUser
	var playerZeroElo float64
	var playerOne model.MinimalUser
	var playerOneElo float64
	if starter == model.FirstPlayerCreator {
		playerZero = configRoom.Creator
		playerZeroElo = configRoom.CreatorElo
		playerOne = *configRoom.ChosenOpponent
		playerOneElo = *configRoom.ChosenOpponentElo
	} else {
		playerZero = *configRoom.ChosenOpponent
		playerZeroElo = *configRoom.ChosenOpponentElo
		playerOne = configRoom.Creator
		playerOneElo = configRoom.CreatorElo
	}

	game := &model.Game{
		GameID:        configRoom.ID,
		GameName:      configRoom.GameName,
		PlayerZero:    playerZero,
		PlayerZeroElo: playerZeroElo,
		PlayerOne:     playerOne,
		PlayerOneElo:  playerOneElo,
		Result:        model.ResultInProgress,
		Beginning:     now,
	}
	s.Games[configRoom.ID] = game
	return game, nil
}

func (s *FakeStore) SetGameResult(game *model.Game, result model.Result) error {
	game.Result = result
	return nil
}

func (s *FakeStore) AddEvent(gameId model.GameID, event *model.GameEvent) error {
	event.GameID = gameId
	s.Events[gameId] = append(s.Events[gameId], *event)
	return nil
}

func (s *FakeStore) ApplyToGameEvents(gameId model.GameID, action func(*model.GameEvent) error) error {
	for i := range s.Events[gameId] {
		if err := action(&s.Events[gameId][i]); err != nil {
			return err
		}
	}
	return nil
}

func (s *FakeStore) GetElo(gameName string, user model.MinimalUser) (*model.Elo, error) {
	if s.Elos[user.ID] == nil {
		s.Elos[user.ID] = make(map[string]*model.Elo)
	}
	elo, ok := s.Elos[user.ID][gameName]
	if !ok {
		elo = &model.Elo{
			UserID:      user.ID,
			UserName:    user.Name,
			GameName:    gameName,
			CurrentElo:  0,
			GamesPlayed: 0,
		}
		s.Elos[user.ID][gameName] = elo
	}
	return elo, nil
}

func (s *FakeStore) GetElos(gameName string, winner model.MinimalUser, loser model.MinimalUser) (*model.Elo, *model.Elo, error) {
	winnerElo, err := s.GetElo(gameName, winner)
	if err != nil {
		return nil, nil, err
	}
	loserElo, err := s.GetElo(gameName, loser)
	if err != nil {
		return nil, nil, err
	}
	return winnerElo, loserElo, nil
}

func (s *FakeStore) UpdateElos(gameName string, winner model.MinimalUser, winnerElo model.Elo, loser model.MinimalUser, loserElo model.Elo) error {
	if s.Elos[winner.ID] == nil {
		s.Elos[winner.ID] = make(map[string]*model.Elo)
	}
	if s.Elos[loser.ID] == nil {
		s.Elos[loser.ID] = make(map[string]*model.Elo)
	}
	s.Elos[winner.ID][gameName].CurrentElo = winnerElo.CurrentElo
	s.Elos[winner.ID][gameName].GamesPlayed = winnerElo.GamesPlayed
	s.Elos[loser.ID][gameName].CurrentElo = loserElo.CurrentElo
	s.Elos[loser.ID][gameName].GamesPlayed = loserElo.GamesPlayed
	return nil
}

func (s *FakeStore) GetCurrentGame(user model.MinimalUser) (*model.CurrentGame, error) {
	return s.CurrentGames[user.ID], nil
}

func (s *FakeStore) SetCurrentGame(currentGame *model.CurrentGame) error {
	s.CurrentGames[currentGame.UserID] = currentGame
	return nil
}

func (s *FakeStore) UpdateCurrentGame(user model.MinimalUser, currentGame *model.CurrentGame) error {
	s.CurrentGames[user.ID] = currentGame
	return nil
}

func (s *FakeStore) RemoveCurrentGame(user model.MinimalUser) error {
	delete(s.CurrentGames, user.ID)
	return nil
}

func (s *FakeStore) AddChatMessage(gameId model.GameID, message *model.Message) error {
	message.GameID = gameId
	s.Messages[gameId] = append(s.Messages[gameId], message)
	return nil
}

func (s *FakeStore) ApplyToMessagesOfGame(gameId model.GameID, action func(*model.Message) error) error {
	for _, m := range s.Messages[gameId] {
		if err := action(m); err != nil {
			return err
		}
	}
	return nil
}

func (s *FakeStore) ApplyToObservers(gameId model.GameID, action func(model.MinimalUser) error) error {
	var observers []model.MinimalUser
	for _, cg := range s.CurrentGames {
		if cg.GameID == gameId && cg.Role == model.UserRoleObserver {
			observers = append(observers, cg.GetUser())
		}
	}
	for _, observer := range observers {
		if err := action(observer); err != nil {
			return err
		}
	}
	return nil
}

var _ model.Store = (*FakeStore)(nil)
