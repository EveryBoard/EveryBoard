package model

type MinimalUser struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	IsBot bool   `json:"isBot,omitempty"`
}
