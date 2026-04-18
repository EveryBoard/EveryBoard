package model

type OutgoingMessage interface {
	Tag() string
}

type Error string

const (
	ErrorInternal          Error = "internal-error"
	ErrorInvalidData       Error = "invalid-data"
	ErrorAlreadySubscribed Error = "already-subscribed"
	ErrorNotSubscribed     Error = "not-subscribed"
	ErrorUnknownMessage    Error = "unknown-message"
	ErrorUnknownGame       Error = "unknown-game"
	ErrorGameDoesNotExist  Error = "game-does-not-exist"
	ErrorNotAllowed        Error = "not-allowed"
)

type ErrorMessage struct {
	Reason Error `json:"reason"`
}

func (m ErrorMessage) Tag() string {
	return "Error"
}

type ChatMessage struct {
	Message Message `json:"message"`
}

func (m ChatMessage) Tag() string {
	return "ChatMessage"
}

type GameCreatedMessage struct {
	GameID GameID `json:"gameId"`
}

func (m GameCreatedMessage) Tag() string {
	return "GameCreated"
}

type ConfigRoomUpdateMessage struct {
	GameID     GameID     `json:"gameId"`
	ConfigRoom ConfigRoom `json:"configRoom"`
}

func (m ConfigRoomUpdateMessage) Tag() string {
	return "ConfigRoomUpdate"
}

type ConfigRoomDeletedMessage struct {
	GameID GameID `json:"gameId"`
}

func (m ConfigRoomDeletedMessage) Tag() string {
	return "ConfigRoomDeleted"
}

type CandidateJoinedMessage struct {
	Candidate MinimalUser `json:"candidate"`
	Elo       float64     `json:"elo"`
}

func (m CandidateJoinedMessage) Tag() string {
	return "CandidateJoined"
}

type CandidateLeftMessage struct {
	Candidate MinimalUser `json:"candidate"`
}

func (m CandidateLeftMessage) Tag() string {
	return "CandidateLeft"
}

type GameUpdateMessage struct {
	Game Game `json:"game"`
}

func (m GameUpdateMessage) Tag() string {
	return "GameUpdate"
}

type GameEventMessage struct {
	Event      GameEvent `json:"event"`
	ServerTime float64   `json:"serverTime"`
}

func (m GameEventMessage) Tag() string {
	return "GameEvent"
}

type CurrentGameUpdateMessage struct {
	CurrentGame *CurrentGame `json:"currentGame"`
}

func (m CurrentGameUpdateMessage) Tag() string {
	return "CurrentGameUpdate"
}
