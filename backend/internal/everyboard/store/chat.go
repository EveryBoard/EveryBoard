package store

import "github.com/EveryBoard/EveryBoard/internal/everyboard/model"

func (s *GORMStore) AddChatMessage(gameId model.GameID, message *model.Message) error {
	message.GameID = gameId
	result := s.db.Create(message)
	return wrapError("AddChatMessage", result.Error)
}

func (s *GORMStore) ApplyToMessagesOfGame(gameId model.GameID, action func(*model.Message) error) error {
	result := s.db.Model(&model.Message{}).Where("game_id = ?", gameId).Order("timestamp ASC")
	return wrapError("ApplyToMessagesOfGame", applyToQueryResult(s.db, result, action))
}
