package protocol

import "github.com/EveryBoard/EveryBoard/internal/everyboard/model"

type OutgoingMessage interface {
	Tag() string
}

type ErrorMessage struct {
	Reason string `json:"reason"`
}

func (m ErrorMessage) Tag() string {
	return "Error"
}

type ChatMessage struct {
	Message model.Message `json:"message"`
}

func (m ChatMessage) Tag() string {
	return "ChatMessage"
}

type GameCreatedMessage struct {
	GameID model.GameID `json:"gameId"`
}

func (m GameCreatedMessage) Tag() string {
	return "GameCreated"
}

type ConfigRoomUpdateMessage struct {
	GameID     model.GameID     `json:"gameId"`
	ConfigRoom model.ConfigRoom `json:"configRoom"`
}

func (m ConfigRoomUpdateMessage) Tag() string {
	return "ConfigRoomUpdate"
}

type ConfigRoomDeletedMessage struct {
	GameID model.GameID `json:"gameId"`
}

func (m ConfigRoomDeletedMessage) Tag() string {
	return "ConfigRoomDeleted"
}

type CandidateJoinedMessage struct {
	Candidate model.MinimalUser `json:"candidate"`
	Elo       float64           `json:"elo"`
}

func (m CandidateJoinedMessage) Tag() string {
	return "CandidateJoined"
}

type CandidateLeftMessage struct {
	Candidate model.MinimalUser `json:"candidate"`
}

func (m CandidateLeftMessage) Tag() string {
	return "CandidateLeft"
}

type GameUpdateMessage struct {
	Game model.Game `json:"game"`
}

func (m GameUpdateMessage) Tag() string {
	return "GameUpdate"
}

type GameEventMessage struct {
	Event      model.GameEvent `json:"event"`
	ServerTime float64         `json:"serverTime"`
}

func (m GameEventMessage) Tag() string {
	return "GameEvent"
}

type CurrentGameUpdateMessage struct {
	CurrentGame *model.CurrentGame `json:"currentGame"`
}

func (m CurrentGameUpdateMessage) Tag() string {
	return "CurrentGameUpdate"
}
