package model

import "encoding/json"

const MaxBotDisplayNameLength = 256

// BotIdentifier represents the identity of a bot
type BotIdentifier struct {
	DisplayName string          `json:"displayName"`
	Parameters  json.RawMessage `json:"parameters"`
}
